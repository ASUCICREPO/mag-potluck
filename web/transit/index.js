const baseApi = "https://earzkgb41e.execute-api.us-east-1.amazonaws.com/prod/"
const apiEndpoints = {
    'registerpatient': baseApi + "transit/registerpatient",
    'signuptransit': baseApi + "transit/account/signupuser",
    'signuptransitconfirm': baseApi + "transit/account/confirmemail",
    'transitlogin': baseApi + "transit/account/login",
    'transitlogout': baseApi + "transit/account/logout",
    'transitemail': baseApi + "transit/sendmail",
}

async function transitEmail(recipient, link, patient_name) {
    const access_token = sessionStorage.getItem("access_token");
    const requestBody = {
        'recipient': recipient,
        'link': link,
        'patient_name': patient_name,
        'access_token': access_token,
    }
    const apiUrl = apiEndpoints['transitemail']
    makePostRequest(apiUrl, requestBody).then((data) => {
            console.log(data.body)
            alert(data.body.ResponseMetadata.HTTPStatusCode)
        }
    )
}

function renderLink(data) {
    document.getElementById('PLink').value = JSON.parse(data).link
}

async function registerPatient(f_name, m_name, l_name) {
    const access_token = sessionStorage.getItem("access_token");
    const requestBody = {
        'f_name': f_name,
        'm_name': m_name,
        'l_name': l_name,
        'initial_entry_ts': Date.now().toString(),
        'access_token': access_token,
    }
    const apiUrl = apiEndpoints['registerpatient']
    makePostRequest(apiUrl, requestBody).then((data) => {
            renderLink(data.body)
        }
    )
}

async function signupTransit(email, password, name, phone) {
    const requestBody = {
        'email': email,
        'password': password,
        'name': name,
        'phone': phone
    }
    const apiUrl = apiEndpoints['signuptransit']
    makePostRequest(apiUrl, requestBody).then((data) => {
            console.log(data)
            // const fName_box = document.getElementById('fName')
            // fName_box.value = data.body.firstname
        }
    )
}

async function signupTransitConfirm(username, code) {
    const requestBody = {
        'username': username,
        'code': code
    }
    const apiUrl = apiEndpoints['signuptransitconfirm']
    makePostRequest(apiUrl, requestBody).then((data) => {
            console.log(data)
            // const fName_box = document.getElementById('fName')
            // fName_box.value = data.body.firstname
        }
    )
}

async function transitLogin(username, password) {
    const requestBody = {
        'username': username,
        'password': password
    }
    const apiUrl = apiEndpoints['transitlogin']
    makePostRequest(apiUrl, requestBody).then((data) => {
            console.log(data)
            if(data.success){
                sessionStorage.setItem("access_token",data.data.access_token);
                sessionStorage.setItem("refresh_token", data.data.refresh_token);
                sessionStorage.setItem("display_name", data.data.display_name);
                window.location.replace(window.location.origin);
            }
            else{
                alert(data.message)
            }

        }
    )
}

async function transitLogout(f_name, m_name, l_name, access_token) {
}

async function makePostRequest(url = '', body = {}) {
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(body) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

