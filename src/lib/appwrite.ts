
import { Client, Account, Databases, ID, Query } from 'appwrite';

export const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6859f0260020a9c2f41a');

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID = 'main';
export const COLLECTIONS = {
  COMPANIES: 'companies',
  CREDIT_CLIENTS: 'creditClients',
  PURCHASES: 'purchases'
};

export { ID, Query };
