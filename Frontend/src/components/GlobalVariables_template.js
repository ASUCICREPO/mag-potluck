global.baseApi = "{{api_url}}";
global.apiEndpoints = {
    'healthemail': global.baseApi + "health/sendmail",
    'getpatientdetails': global.baseApi + "health/getpatientdetails",
    'updatepatient': global.baseApi + "health/updatepatient",
    'registerpatient': global.baseApi + "transit/registerpatient",
    'signuptransit': global.baseApi + "transit/account/signupuser",
    'signuptransitconfirm': global.baseApi + "transit/account/confirmemail",
    'transitlogin': global.baseApi + "transit/account/login",
    'transitlogout': global.baseApi + "transit/account/logout",
    'transitemail': global.baseApi + "transit/sendmail",
};