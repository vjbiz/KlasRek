import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { app, auth } from './googleAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  ClassSettings, 
  AttendanceDay, 
  ScoreColumn, 
  Student 
} from '../types/classRecord';

// CRITICAL: Initialize Firestore with the provisioned firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by the Firebase skill
export async function testConnection(): Promise<boolean> {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    // We do not rethrow on connection probe to avoid blocking UI on non-existent test doc
    return false;
  }
}

// Auto-run connection test
testConnection();

export interface SavedClassSummary {
  id: string;
  subjectCode: string;
  subjectName: string;
  className: string;
  academicYear: string;
  semester: string;
  updatedAt?: any;
}

/**
 * Persists the entire class record and student roster into Cloud Firestore.
 */
export async function saveClassToFirestore(
  classId: string,
  settings: ClassSettings,
  attendanceDays: AttendanceDay[],
  speakingColumns: ScoreColumn[],
  quizzesColumns: ScoreColumn[],
  participationColumns: ScoreColumn[],
  notebookColumns: ScoreColumn[],
  students: Student[]
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to save to Cloud Firestore.');

  const classRef = doc(db, 'classes', classId);
  const classPath = `classes/${classId}`;

  try {
    // Check if class exists to preserve createdAt
    let isExisting = false;
    try {
      const snap = await getDoc(classRef);
      isExisting = snap.exists();
    } catch (e) {
      // ignore
    }

    const classData: Record<string, any> = {
      id: classId,
      teacherId: user.uid,
      teacherEmail: user.email || '',
      subjectCode: settings.subjectCode || 'ENG101',
      subjectName: settings.subjectName || 'English',
      className: settings.className || 'M.1/1',
      semester: settings.semester || '1',
      academicYear: settings.academicYear || '2567',
      schoolName: settings.schoolName || 'School',
      teacherName: settings.teacherName || user.displayName || 'Instructor',
      passingScore: settings.passingScore || 50,
      attendanceDays,
      speakingColumns,
      quizzesColumns,
      participationColumns,
      notebookColumns,
      updatedAt: serverTimestamp(),
    };

    if (!isExisting) {
      classData.createdAt = serverTimestamp();
    }

    await setDoc(classRef, classData, { merge: true });

    // Save students in batch
    if (students.length > 0) {
      const batch = writeBatch(db);
      for (const student of students) {
        const studentRef = doc(db, 'classes', classId, 'students', student.id);
        const studentData: Record<string, any> = {
          id: student.id,
          classId: classId,
          teacherId: user.uid,
          number: student.number,
          studentNumber: student.studentNumber,
          thaiName: student.thaiName,
          englishName: student.englishName,
          password: student.password || `STU-${student.studentNumber}`,
          attendance: student.attendance || {},
          speakingScores: student.speakingScores || {},
          quizzesScores: student.quizzesScores || {},
          participationScores: student.participationScores || {},
          notebookScores: student.notebookScores || {},
          midtermScore: student.midtermScore ?? null,
          finalScore: student.finalScore ?? null,
          updatedAt: serverTimestamp(),
        };
        batch.set(studentRef, studentData, { merge: true });
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, classPath);
  }
}

/**
 * Loads a class record and student roster from Cloud Firestore.
 */
export async function loadClassFromFirestore(classId: string): Promise<{
  settings: Partial<ClassSettings>;
  attendanceDays: AttendanceDay[];
  speakingColumns: ScoreColumn[];
  quizzesColumns: ScoreColumn[];
  participationColumns: ScoreColumn[];
  notebookColumns: ScoreColumn[];
  students: Student[];
} | null> {
  const classPath = `classes/${classId}`;
  try {
    const classSnap = await getDoc(doc(db, 'classes', classId));
    if (!classSnap.exists()) return null;

    const data = classSnap.data();

    // Fetch students
    const studentsSnap = await getDocs(collection(db, 'classes', classId, 'students'));
    const loadedStudents: Student[] = [];

    studentsSnap.forEach((docSnap) => {
      const s = docSnap.data();
      loadedStudents.push({
        id: s.id || docSnap.id,
        number: s.number,
        studentNumber: s.studentNumber,
        thaiName: s.thaiName,
        englishName: s.englishName,
        password: s.password,
        attendance: s.attendance || {},
        speakingScores: s.speakingScores || {},
        quizzesScores: s.quizzesScores || {},
        participationScores: s.participationScores || {},
        notebookScores: s.notebookScores || {},
        midtermScore: s.midtermScore,
        finalScore: s.finalScore,
      });
    });

    loadedStudents.sort((a, b) => a.number - b.number);

    return {
      settings: {
        subjectCode: data.subjectCode,
        subjectName: data.subjectName,
        className: data.className,
        semester: data.semester,
        academicYear: data.academicYear,
        schoolName: data.schoolName,
        teacherName: data.teacherName,
        passingScore: data.passingScore,
      },
      attendanceDays: data.attendanceDays || [],
      speakingColumns: data.speakingColumns || [],
      quizzesColumns: data.quizzesColumns || [],
      participationColumns: data.participationColumns || [],
      notebookColumns: data.notebookColumns || [],
      students: loadedStudents,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, classPath);
  }
}

/**
 * Lists all classes created by the signed-in teacher.
 */
export async function listTeacherClasses(): Promise<SavedClassSummary[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const path = 'classes';
  try {
    const q = query(collection(db, 'classes'), where('teacherId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const classes: SavedClassSummary[] = [];

    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      classes.push({
        id: docSnap.id,
        subjectCode: d.subjectCode || 'N/A',
        subjectName: d.subjectName || '',
        className: d.className || '',
        academicYear: d.academicYear || '',
        semester: d.semester || '',
        updatedAt: d.updatedAt,
      });
    });

    return classes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
