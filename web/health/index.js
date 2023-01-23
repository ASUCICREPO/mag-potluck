const baseApi = "https://earzkgb41e.execute-api.us-east-1.amazonaws.com/prod/"
const apiEndpoints = {
    'healthemail': baseApi + "health/sendmail",
    'getpatientdetails': baseApi + "health/getpatientdetails",
    'updatepatient': baseApi + "health/updatepatient"
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

function extractIdFromURL() {
    const url = document.URL
    return url.substring(url.lastIndexOf('?') + 1)
}

function renderPatientData(data){
    const fName_box = document.getElementById('fName')
    const lName_box = document.getElementById('lName')
    const mName_box = document.getElementById('mName')
    const tProvider_box = document.getElementById('tProvider')
    fName_box.value = JSON.parse(data).firstname
    lName_box.value = JSON.parse(data).lastname
    mName_box.value = JSON.parse(data).middelname
    tProvider_box.value = JSON.parse(data).transitprovidername
}

async function getPatientDetails(id) {
    const requestBody = {'id': id}
    const apiUrl = apiEndpoints['getpatientdetails']
    makePostRequest(apiUrl, requestBody).then((data) => {
            //console.log(data.body)
            // const fName_box = document.getElementById('fName')
            // fName_box.value = data.body.firstname
            renderPatientData(data.body)
        }
    )
}

async function healthEmail(f_name, m_name, l_name, access_token) {
}

async function updatePatient(f_name, m_name, l_name, access_token) {
}

// getPatientDetails("32ca816f060ca5ccc8e803500108bda7")