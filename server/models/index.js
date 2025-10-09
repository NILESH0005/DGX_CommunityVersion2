import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
import UserModel from "../models/User.js";
import Community_Blog from "../models/Community_Blog.js";
import Community_Discussion from "./Community_Discussion.js";
import Community_Events from "./Community_Events.js";
import FilesDetails from "./FilesDetails.js";
import GroupMaster from "./GroupMaster.js";
import Modules_Details from "./Modules_Details.js";
import QuestionOptions from "./QuestionOptions.js";
import Questions from "./Questions.js";
import Quiz_Score from "./Quiz_Score.js";
import QuizMapping from "./QuizMapping.js";
import SubModulesDetails from "./SubModulesDetails.js";
import tblCMSContent from "./tblCMSContent.js";
import DDReference from "./DDReference.js";
import UnitsDetails from "./UnitsDetails.js";
import UserLmsProgress from "./UserLmsProgress.js";
import QuizDetailsModel from "./QuizDetails.js";
import UserActivityModel from "./UserActivity.js";
import ContentEngagementModel from "./ContentEngagement.js";
import ContactUsModel from "../models/Contact_Us.js";

const User = UserModel(sequelize, DataTypes);
const LMSUserProgress = UserLmsProgress(sequelize, DataTypes);
const CommunityBlog = Community_Blog(sequelize, DataTypes);
const CommunityDiscussion = Community_Discussion(sequelize, DataTypes);
const CommunityEvents = Community_Events(sequelize, DataTypes);
const LMSFilesDetails = FilesDetails(sequelize, DataTypes);
const Group_Master = GroupMaster(sequelize, DataTypes);
const LMSModulesDetails = Modules_Details(sequelize, DataTypes);
const QuizQuestionOptions = QuestionOptions(sequelize, DataTypes);
const QuizQuestions = Questions(sequelize, DataTypes);
const QuizScore = Quiz_Score(sequelize, DataTypes);
const QuizMapp = QuizMapping(sequelize, DataTypes);
const LMSSubModulesDetails = SubModulesDetails(sequelize, DataTypes);
const CMSContent = tblCMSContent(sequelize, DataTypes);
const TableDDReference = DDReference(sequelize, DataTypes);
const LMSUnitsDetails = UnitsDetails(sequelize, DataTypes);
const QuizDetails = QuizDetailsModel(sequelize, DataTypes);
const UserActivity = UserActivityModel(sequelize, DataTypes);
const ContentEngagement = ContentEngagementModel(sequelize, DataTypes);
const ContactUs = ContactUsModel(sequelize, DataTypes);

const db = {
  sequelize,
  User,
  CommunityBlog,
  CommunityDiscussion,
  CommunityEvents,
  
  LMSFilesDetails,
  Group_Master,
  LMSModulesDetails,
  QuizQuestionOptions,
  QuizQuestions,
  QuizScore,
  QuizDetails,
  QuizMapp,
  LMSSubModulesDetails,
  CMSContent,
  TableDDReference,
  LMSUnitsDetails,
  LMSUserProgress,
  UserActivity,
  ContentEngagement,
  ContactUs
};

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.LMSUnitsDetails.hasMany(db.LMSFilesDetails, { foreignKey: "UnitID" });
db.LMSFilesDetails.belongsTo(db.LMSUnitsDetails, { foreignKey: "UnitID" });
// User ↔ Blog
User.hasMany(CommunityBlog, { foreignKey: "UserID" });
CommunityBlog.belongsTo(User, { foreignKey: "UserID" });

db.LMSSubModulesDetails.hasMany(db.LMSUnitsDetails, {
  foreignKey: "SubModuleID",
  as: "Units",
});
db.LMSUnitsDetails.belongsTo(db.LMSSubModulesDetails, {
  foreignKey: "SubModuleID",
});

db.LMSFilesDetails.hasMany(db.LMSUserProgress, { foreignKey: "FileID" });
db.LMSUserProgress.belongsTo(db.LMSFilesDetails, { foreignKey: "FileID" });

// User ↔ Discussion
User.hasMany(CommunityDiscussion, { foreignKey: "UserID" });
CommunityDiscussion.belongsTo(User, { foreignKey: "UserID" });

// Events ↔ Reference Table
CommunityEvents.belongsTo(TableDDReference, {
  foreignKey: "EventType",
  targetKey: "idCode",
  as: "EventTypeRef",
});

CommunityEvents.belongsTo(TableDDReference, {
  foreignKey: "Category",
  targetKey: "idCode",
  as: "CategoryRef",
});

//Questions ↔ GroupMaster
db.QuizQuestions.belongsTo(db.Group_Master, { foreignKey: "group_id" });

// Questions ↔ DDReference
db.QuizQuestions.belongsTo(db.TableDDReference, {
  foreignKey: "Ques_level",
  targetKey: "idCode",
});

// Questions ↔ Options
db.QuizQuestions.hasMany(db.QuizQuestionOptions, { foreignKey: "question_id" });
db.QuizQuestionOptions.belongsTo(db.QuizQuestions, {
  foreignKey: "question_id",
});

// Questions ↔ QuizMapping
db.QuizQuestions.hasMany(db.QuizMapp, { foreignKey: "QuestionsID" });
db.QuizMapp.belongsTo(db.QuizQuestions, { foreignKey: "QuestionsID" });

// QuizDetails ↔ QuizQuestions (via QuizMapping, but direct optional)
db.QuizQuestions.belongsTo(db.QuizDetails, {
  foreignKey: "id",
  targetKey: "QuizID",
});
db.QuizDetails.hasMany(db.QuizMapp, { foreignKey: "quizId", as: "QuizMapps" });
db.QuizMapp.belongsTo(db.QuizDetails, {
  foreignKey: "quizId",
  as: "QuizDetails",
});

CommunityBlog.belongsTo(User, {
  foreignKey: "RepostUserID",
  as: "RepostUser",
});
export default db;
export { sequelize };




