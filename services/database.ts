import * as SQLite from 'expo-sqlite';

export interface Person {
    id: number;
    name: string;
    status: string;
    privateNotes?: string;
    pipelineType?: string;
    pipelineStage?: string;

    // Contact Info
    email?: string;
    phone?: string;
    address?: string;

    // Personal Details
    birthday?: string; // ISO Date "YYYY-MM-DD"
    spouseName?: string;
    childrenNames?: string; // Comma separated

    // Ministry Details
    prayerRequests?: string;
    interests?: string; // Brainstorming/Connection points
}

export interface Interaction {
    id: number;
    personId: number;
    type: string;
    notes?: string;
    date: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    dueDate: string; // ISO string
    isCompleted: boolean;
    relatedPersonId?: number;
    type: string; // 'manual', 'system', 'birthday'
}

const db = SQLite.openDatabaseSync('careo.db');

export const DatabaseService = {
    init: () => {
        db.execSync(`
      CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        privateNotes TEXT,
        pipelineType TEXT,
        pipelineStage TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        birthday TEXT,
        spouseName TEXT,
        childrenNames TEXT,
        prayerRequests TEXT,
        interests TEXT
      );
      CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        personId INTEGER NOT NULL,
        type TEXT NOT NULL,
        notes TEXT,
        date TEXT NOT NULL,
        FOREIGN KEY (personId) REFERENCES people (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT NOT NULL,
        isCompleted INTEGER DEFAULT 0,
        relatedPersonId INTEGER,
        type TEXT NOT NULL,
        FOREIGN KEY (relatedPersonId) REFERENCES people (id) ON DELETE SET NULL
      );
    `);

        // Auto-migration for existing tables (swallow errors if columns exist)
        const migrations = [
            'ALTER TABLE people ADD COLUMN pipelineType TEXT',
            'ALTER TABLE people ADD COLUMN pipelineStage TEXT',
            'ALTER TABLE people ADD COLUMN email TEXT',
            'ALTER TABLE people ADD COLUMN phone TEXT',
            'ALTER TABLE people ADD COLUMN address TEXT',
            'ALTER TABLE people ADD COLUMN birthday TEXT',
            'ALTER TABLE people ADD COLUMN spouseName TEXT',
            'ALTER TABLE people ADD COLUMN childrenNames TEXT',
            'ALTER TABLE people ADD COLUMN prayerRequests TEXT',
            'ALTER TABLE people ADD COLUMN interests TEXT'
        ];

        migrations.forEach(query => {
            try { db.execSync(query); } catch (e) { }
        });
    },

    getPeople: (): Person[] => {
        return db.getAllSync('SELECT * FROM people');
    },

    getPerson: (id: number): Person | null => {
        return db.getFirstSync('SELECT * FROM people WHERE id = ?', id);
    },

    addPerson: (person: Omit<Person, 'id'>) => {
        const result = db.runSync(
            `INSERT INTO people (
                name, status, privateNotes, pipelineType, pipelineStage,
                email, phone, address, birthday, spouseName, childrenNames, prayerRequests, interests
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            person.name,
            person.status,
            person.privateNotes ?? null,
            person.pipelineType ?? null,
            person.pipelineStage ?? null,
            person.email ?? null,
            person.phone ?? null,
            person.address ?? null,
            person.birthday ?? null,
            person.spouseName ?? null,
            person.childrenNames ?? null,
            person.prayerRequests ?? null,
            person.interests ?? null
        );
        return result.lastInsertRowId;
    },

    updatePerson: (person: Person) => {
        db.runSync(
            `UPDATE people SET 
                name = ?, status = ?, privateNotes = ?, pipelineType = ?, pipelineStage = ?,
                email = ?, phone = ?, address = ?, birthday = ?, spouseName = ?, childrenNames = ?, prayerRequests = ?, interests = ?
             WHERE id = ?`,
            person.name,
            person.status,
            person.privateNotes ?? null,
            person.pipelineType ?? null,
            person.pipelineStage ?? null,
            person.email ?? null,
            person.phone ?? null,
            person.address ?? null,
            person.birthday ?? null,
            person.spouseName ?? null,
            person.childrenNames ?? null,
            person.prayerRequests ?? null,
            person.interests ?? null,
            person.id
        );
    },

    deletePerson: (id: number) => {
        db.runSync('DELETE FROM interactions WHERE personId = ?', id);
        db.runSync('DELETE FROM tasks WHERE relatedPersonId = ?', id);
        db.runSync('DELETE FROM people WHERE id = ?', id);
    },

    getInteractions: (personId: number): Interaction[] => {
        return db.getAllSync('SELECT * FROM interactions WHERE personId = ? ORDER BY date DESC', personId);
    },

    addInteraction: (interaction: Omit<Interaction, 'id'>) => {
        db.runSync(
            'INSERT INTO interactions (personId, type, notes, date) VALUES (?, ?, ?, ?)',
            interaction.personId,
            interaction.type,
            interaction.notes ?? null,
            interaction.date
        );
    },

    getInteraction: (id: number): Interaction | null => {
        return db.getFirstSync('SELECT * FROM interactions WHERE id = ?', id);
    },

    updateInteraction: (interaction: Interaction) => {
        db.runSync(
            'UPDATE interactions SET date = ?, type = ?, notes = ? WHERE id = ?',
            interaction.date,
            interaction.type,
            interaction.notes ?? null,
            interaction.id
        );
    },

    deleteInteraction: (id: number) => {
        db.runSync('DELETE FROM interactions WHERE id = ?', id);
    },

    getTasks: (date: string): Task[] => {
        // Get tasks due on or before the given date that are incomplete, OR tasks due exactly on the date (even if completed)
        return db.getAllSync('SELECT * FROM tasks WHERE (dueDate = ?) OR (dueDate < ? AND isCompleted = 0) ORDER BY dueDate ASC', date, date);
    },

    addTask: (task: Omit<Task, 'id'>) => {
        db.runSync(
            'INSERT INTO tasks (title, description, dueDate, isCompleted, relatedPersonId, type) VALUES (?, ?, ?, ?, ?, ?)',
            task.title,
            task.description ?? null,
            task.dueDate,
            task.isCompleted ? 1 : 0,
            task.relatedPersonId ?? null,
            task.type
        );
    },

    toggleTask: (id: number, isCompleted: boolean) => {
        db.runSync('UPDATE tasks SET isCompleted = ? WHERE id = ?', isCompleted ? 1 : 0, id);
    }
};
