import type { Contact } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Contact management
  getAllContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  setContacts(contacts: Contact[]): Promise<Contact[]>;
  clearContacts(): Promise<void>;
}

export class MemStorage implements IStorage {
  private contacts: Map<string, Contact>;

  constructor() {
    this.contacts = new Map();
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async setContacts(contacts: Contact[]): Promise<Contact[]> {
    this.contacts.clear();
    const contactsWithIds = contacts.map(contact => ({
      ...contact,
      id: contact.id || randomUUID(),
    }));
    
    for (const contact of contactsWithIds) {
      this.contacts.set(contact.id, contact);
    }
    
    return contactsWithIds;
  }

  async clearContacts(): Promise<void> {
    this.contacts.clear();
  }
}

export const storage = new MemStorage();
