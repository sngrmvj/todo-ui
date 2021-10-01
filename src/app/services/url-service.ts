



export const UrlService = {

    //admins
    pingURL:"/authentication/ping",
    migrationURl:"/authentication/migrations",

    // AuthVariables
    registerURL : "/authentication/register",
    loginURL : "/authentication/login",

    getAccessTokenURL : "/authentication/get_access",
    check_authorization: "/authentication/check_authorize",

    validateOTPURL : "/authentication/validate_otp",
    sendOtpURL : "/authentication/otp",

    forgotPasswordURL: "/authentication/reset",
    

    accountDeleteURL:"/authentication/account_delete",
    deleteUserURL:"/authentication/delete",

    updateEmailURL :"/authentication/updateEmail",
    updatelastnameURL : "/authentication/lastname",
    updatefirstnameURL : "/authentication/firstname",
    passwordResetFromProfileURl: "/authentication/change_password_from_profile",

    make_adminURL: "/authentication/makeAdmin",
    blacklistTokenURL: "/authentication/blacklist",

    feedbackURL : "/authentication/feedback",
    displayFeedbackURL :"/authentication/display_feedback",

    getAllURL: "/authentication/get_all",
    getUserURL: "/authentication/get_user",


    post_tasks_general_url : "/todo/general/post_tasks",
    get_tasks_general_url: "/todo/general/active_tasks",
    toggle_general_url: "/todo/general/toggle",
    deleted_general_url: "/todo/general/delete",

    post_tasks_daily_url : "/todo/daily/post_tasks",
    get_tasks_daily_url: "/todo/daily/active_tasks",
    toggle_daily_url: "/todo/daily/toggle",
    deleted_daily_url: "/todo/daily/delete",
    fetch_refreshed_daily_tasks_url : "/todo/daily/refresh"

};