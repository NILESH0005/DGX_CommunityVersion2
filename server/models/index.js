import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
import UserModel from "./User.js";
import Community_Blog from "./Community_Blog.js";
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
  QuizMapp,
  LMSSubModulesDetails,
  CMSContent,
  TableDDReference,
  LMSUnitsDetails,
  LMSUserProgress,
};

export default db;
export { sequelize };
