const admin = require('firebase-admin');

// --- IMPORTANT ---
// This script uses a service account key to access your Firebase project.
// It assumes the key is named 'sp.json' and is located in the parent 'admin' directory.
const serviceAccount = require('../sp.json');

// --- SCRIPT CONFIGURATION ---
// Add the names of all your top-level collections to be deleted here.
const COLLECTIONS_TO_DELETE = ['classes', 'screenshots', 'students', 'progress', 'irregularities', 'notifications', 'prompts', 'mails', 'zipJobs', 'videoJobs'];

/**
 * Initializes the Firebase Admin SDK.
 */
function initializeFirebase() {
  try {
    const bucketName = `gemini-ai-classroom-assistant.firebasestorage.app`;
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: bucketName
    });
    console.log(`Firebase Admin SDK initialized successfully for project ${serviceAccount.project_id}.`);
    return app;
  } catch (error) {
    console.error('\nERROR: Could not initialize Firebase Admin SDK.', error);
    console.error('Please ensure \'sp.json\' is in the admin directory.');
    process.exit(1);
  }
}

/**
 * Deletes all files from the default Firebase Storage bucket.
 * @param {admin.app.App} app The initialized Firebase app instance.
 */
async function resetStorage(app) {
  const bucket = app.storage().bucket();
  console.log('\n--- Starting Storage Reset ---');
  try {
    const [files] = await bucket.getFiles();
    if (files.length === 0) {
      console.log('Storage bucket is already empty.');
      console.log('--- Storage Reset Complete ---');
      return;
    }
    console.log(`Found ${files.length} files to delete in bucket: ${bucket.name}`);

    // Process deletions in batches to avoid excessive concurrent requests
    const batchSize = 100; // Adjust batch size as needed
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(async (file) => {
        console.log(`Deleting file: ${file.name}`);
        await file.delete();
      }));
      console.log(`Deleted batch of ${batch.length} files.`);
    }

    console.log(`Successfully deleted ${files.length} files.`);
  } catch (error) {
    console.error('Error during Storage reset:', error);
  }
  console.log('--- Storage Reset Complete ---');
}

/**
 * Deletes an entire collection, including subcollections, in batches.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 * @param {string} collectionPath The path to the collection to delete.
 * @param {number} batchSize The number of documents to delete at a time.
 */
async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  let query = collectionRef.orderBy('__name__').limit(batchSize);

  while (true) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      return; // We're done
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      console.log(`Deleting doc: ${doc.id} from collection: ${doc.ref.parent.path}`);
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Get the last document from the batch
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    // Construct a new query starting after this document
    query = collectionRef.orderBy('__name__').startAfter(lastVisible).limit(batchSize);
  }
}


/**
 * Deletes all specified Firestore collections.
 * @param {admin.app.App} app The initialized Firebase app instance.
 */
async function resetFirestore(app) {
  const db = app.firestore();
  console.log('\n--- Starting Firestore Reset ---');

  for (const collectionId of COLLECTIONS_TO_DELETE) {
    console.log(`\nDeleting all documents from '${collectionId}' collection...`);
    try {
      await deleteCollection(db, collectionId, 100);
      console.log(`Successfully deleted collection '${collectionId}'.`);
    } catch (error) {
      console.error(`Failed to delete collection '${collectionId}'.`, error);
    }
  }

  console.log('\n--- Firestore Reset Complete ---');
}


/**
 * Main function to run the entire reset process.
 */
async function main() {
  console.log('*****************************************************************');
  console.log('******************  APPLICATION RESET SCRIPT  *******************');
  console.log('*****************************************************************');
  console.log('WARNING: This script will permanently delete data from your project.');

  const app = initializeFirebase();

  // You can comment out any of these lines to run only specific resets.
  await resetStorage(app);
  await resetFirestore(app);

  console.log('\nApplication reset process finished.');
}

// Execute the script
main();