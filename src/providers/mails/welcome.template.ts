export const sendWelcomeStaffEmail= (
	fullName: string,
	email: string,
  ID: string,
  password: string
) => {
	return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div>
    <p>
      <div>Hello ${fullName}</div>
      <div>Welcome to our organization!!!</div>
		</p>
    <div>
    <p> Your login details are as follows. You have to change password to your desired password on first log in</p>
      <p>
         Email: ${email} 
      </p>
            <p>
         StaffID: ${ID} 
      </p>
            <p>
         Password: ${password} 
      </p>
    </div>
		<p>
      <div>Kind Regards,</div><br>
      <div>Heckerbella Hospital Management System</div>
		  
	</p>
  </div>
</body>
</html>
  `;
};