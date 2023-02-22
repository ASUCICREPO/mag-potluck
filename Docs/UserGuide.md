# User Guide / How to use

## Transit Service Provider

1. If you attempt a new deployment, it outputs a link which hosts the system. Copy that URL.
2. Launch a browser and got to the URL.
3. By default, The `login` page will be loaded. This is for the Transit side authentication.
   ![Login](Docs/login.png)
      a. If you already have an account, put in your registered Email and password in the textboxes and click on Login. 
      b. If you need to register a new user, go to the `signup` URL 
   ![Signup](Docs/signup.png)
4. Fill in the required details, and press the `SignUp` button. This will take you to the `email verification` page.
   ![Verify email](Docs/verify_email.png)
5. Input the One Time Password that you have got in your email used for registration in step 5.
6. Now you have successfully created your account as a transit provider in this web portal.
7. Once the email is confirmed, you will be redirected to the `login` page (Shown in step 3).
8. Login here using the `email` and `password` you used for registration in step 5.
9. Once you have successfully logged in, you will land on the page to input patient details.
   ![Input patient](Docs/input_patient.png)
10. Fill in all the details for the patient and click on the `Generate Link` button.
11. The patient's unique URL and an option to email the URL will be displayed. The URL can be copied and sent to
Healthcare providers, or can directly be sent directly as an email from this page.
    ![Patient Link](Docs/patient_link.png)

## Healthcare Service Provider

1. The healthcare service provider gets the patients unique URL from the transit service provider.
2. Opening the URL on a web browser will take you to the `patient detail` page.
   ![Patient Page](Docs/patient_page.png)
3. Input the current appointment details of the patient in this page. This will take you to a page that gives the options to `Cancel` and `Reschedule` the appointment.
4. Clicking on `Cancel` button will send a notification via email to the transit service provider, saying that the appointment is cancelled.
5. CLicking on the `Reschedule` button will ask you to input the new appointment details.
   ![Reschedule](Docs/reschedule.png)
6. Clicking on the `submit` button after filling in the new details, will send a notification via email, to the transit provider, about the new appointment details.
7. Once you have `cancelled` or `rescheduled` the appointment, you will be taken to the following page, confirming your action.
   ![Confirmation](Docs/confirmation.png)
