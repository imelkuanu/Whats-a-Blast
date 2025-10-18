import { google } from 'googleapis';

// Google Sheets client dengan Service Account
export async function getGoogleSheetClient() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceAccountEmail || !privateKey) {
      throw new Error('Google Service Account credentials not configured. Please check environment variables.');
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client. Please check your credentials.');
  }
}

export function extractSpreadsheetId(url: string): string {
  // Support berbagai format URL Google Sheets
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)\//,
    /^([a-zA-Z0-9-_]+)$/ // Hanya spreadsheet ID saja
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error('URL Google Sheets tidak valid. Format yang didukung: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/ atau hanya SPREADSHEET_ID saja');
}

export function columnToIndex(column: string): number {
  let result = 0;
  column = column.toUpperCase();
  
  for (let i = 0; i < column.length; i++) {
    const charCode = column.charCodeAt(i);
    if (charCode < 65 || charCode > 90) {
      throw new Error(`Kolom tidak valid: ${column}`);
    }
    result = result * 26 + (charCode - 64); // A=1, B=2, ..., Z=26
  }
  
  return result - 1; // Convert to 0-based index
}

// Utility function untuk test koneksi
export async function testGoogleSheetsConnection() {
  try {
    const sheets = await getGoogleSheetClient();
    console.log('Google Sheets client initialized successfully');
    return true;
  } catch (error) {
    console.error('Google Sheets connection test failed:', error);
    return false;
  }
}