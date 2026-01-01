import { defineData, a, type ClientSchema } from "@aws-amplify/backend";

/**
 * Data schema for AgentCore Academy
 * Uses single-table design patterns with DynamoDB
 */
const schema = a.schema({
  // User profile information
  UserProfile: a
    .model({
      userId: a.id().required(),
      email: a.string().required(),
      name: a.string(),
      avatarUrl: a.string(),
      authProvider: a.enum(["GITHUB", "GOOGLE"]),
      lastActiveAt: a.datetime(),
      owner: a.string(),
    })
    .identifier(["userId"])
    .authorization((allow) => [allow.owner()]),

  // Progress tracking per module
  ModuleProgress: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      moduleId: a.string().required(),
      status: a.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
      startedAt: a.datetime(),
      completedAt: a.datetime(),
      currentLessonId: a.string(),
      // Store comprehension check results as JSON
      comprehensionChecks: a.json(),
      // Bookmarked lesson IDs
      bookmarks: a.string().array(),
      // Owner field for authorization - maps to Cognito identity
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index("userId").sortKeys(["moduleId"]).queryField("progressByUser"),
    ])
    .authorization((allow) => [allow.owner()]),

  // User notes per lesson
  UserNote: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      moduleId: a.string().required(),
      lessonId: a.string().required(),
      content: a.string().required(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index("userId")
        .sortKeys(["moduleId", "lessonId"])
        .queryField("notesByUserAndLesson"),
    ])
    .authorization((allow) => [allow.owner()]),

  LearningState: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      moduleId: a.string().required(),
      lastContext: a.string(),
      topicsExplained: a.string().array(),
      identifiedGaps: a.string().array(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index("userId").sortKeys(["moduleId"]).queryField("learningStateByUser"),
    ])
    .authorization((allow) => [allow.owner()]),

  ExerciseSubmission: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      moduleId: a.string().required(),
      exerciseId: a.string().required(),
      formData: a.json().required(),
      status: a.enum(["DRAFT", "SUBMITTED"]),
      submittedAt: a.datetime(),
      updatedAt: a.datetime(),
      owner: a.string(),
    })
    .secondaryIndexes((index) => [
      index("userId").sortKeys(["moduleId"]).queryField("submissionsByUser"),
    ])
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
