import './firebase.js';

import { onCallGenkit } from "firebase-functions/v2/https";
import { analyzeImageFlow, analyzeAllImagesFlow } from "./gemini.js";

export * from './processVideoJob.js';
export * from './processZipJob.js';
export * from './storageQuota.js';
export * from './ipRestriction.js';
export * from './deleteJobs.js';
export * from './cleanupStuckJobs.js';
export * from './processVideoAnalysisJob.js';
export * from './updateQuota.js';
export * from './scheduledTasks.js';
export * from './userManagement.js';
import { CORS_ORIGINS } from './config.js';

const callOptions = {
  cors: CORS_ORIGINS,
  enforceAppCheck: true,
  memory: '1GiB',
};

export const analyzeImage = onCallGenkit({
    ...callOptions,    
    authPolicy: (auth) => {
        return auth?.token?.email_verified && auth?.token?.role === 'teacher';
    },
}, analyzeImageFlow);

export const analyzeAllImages = onCallGenkit({
    ...callOptions,
    authPolicy: (auth) => {
        return auth?.token?.email_verified && auth?.token?.role === 'teacher';
    },
}, analyzeAllImagesFlow);
