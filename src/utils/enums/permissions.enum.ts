/**
 * THE DEFINTIONS HERE SHOULD BE CONSISTENT WITH WHAT IS ON THE DATABASE
 */
export enum ApplicationPermissions {
  // express permission to manage everything for permissions
  CAN_MANAGE_PERMISSION = 'CAN_MANAGE_PERMISSION',
  //express permission to manage everything for students
  CAN_MANAGE_STUDENT = 'CAN_MANAGE_STUDENT',
  // permission to search for students
  CAN_SEARCH_STUDENT = 'CAN_SEARCH_STUDENT',
  //express permission to manage everything for staff
  CAN_MANAGE_STAFF = 'CAN_MANAGE_STAFF',
  // this permission gives all the access needed to manage a school
  CAN_MANAGE_SCHOOL = 'CAN_MANAGE_SCHOOL',
  //
  CAN_UPLOAD_PROFILE_PICTURE = 'CAN_UPLOAD_PROFILE_PICTURE',
  //
  CAN_MANAGE_DISTRICT = 'CAN_MANAGE_DISTRICT',
  //
  CAN_SWITCH_ROLE = 'CAN_SWITCH_ROLE',
  //
  CAN_TRANSFER_RIGHTS = 'CAN_TRANSFER_RIGHTS',
  //
  CAN_SEARCH_STAFF = 'CAN_SEARCH_STAFF',
  //
  CAN_VIEW_STAFF = 'CAN_VIEW_STAFF',
  //
  CAN_VIEW_DISTRICT = 'CAN_VIEW_DISTRICT',
  // CBT PERMISSIONS
  CAN_MANAGE_CBT = 'CAN_MANAGE_CBT',
  //
  CAN_MANAGE_TOPIC = 'CAN_MANAGE_TOPIC',
  //permission to manage subject
  CAN_MANAGE_SUBJECT = 'CAN_MANAGE_SUBJECT', //NOTE FUTUREX PERMISSION
  // permission to manage student subject grades
  CAN_MANAGE_SUBJECT_GRADES = 'CAN_MANAGE_SUBJECT_GRADES',
  //Permission to manage a class-arm
  CAN_MANAGE_CLASSARM = 'CAN_MANAGE_CLASSARM',
  // permission o manage calendar
  CAN_MANAGE_CALENDAR = 'CAN_MANAGE_CALENDAR',
  // permission to view a state
  CAN_VIEW_STATE = 'CAN_VIEW_STATE',
  // permission to manage a state
  CAN_MANAGE_STATE = 'CAN_MANAGE_STATE',
  // permission to verify an organization e.g district, states
  CAN_VERIFY_ORGANIZATION = 'CAN_VERIFY_ORGANIZATION', //NOTE future permission
  //permission to view information about a school, district or state
  CAN_VIEW_DASHBOARD = 'CAN_VIEW_DASHBOARD',
  //permission to transfer student to another school
  CAN_TRANSFER_STUDENT = 'CAN_TRANSFER_STUDENT',
  //permission to view scheme of work
  CAN_VIEW_SCHEME_OF_WORK = 'CAN_VIEW_SCHEME_OF_WORK',
  //permission to search report card
  CAN_MANAGE_REPORT_CARD = 'CAN_MANAGE_REPORT_CARD',
  //permission to generate report-card
  CAN_GENERATE_REPORT_CARD = 'CAN_GENERATE_REPORT_CARD',
  //
  CAN_VIEW_REPORT_CARD = 'CAN_VIEW_REPORT_CARD',
  //
}
