export const sendResetPasswordMail = (
  fullName: string,
  link: string,
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
		</p>
    <div>
    <p> You requested for password change. Please click on this <a href=${link}>link</a> to reset your password</p>
    <p>Or click on the button below</p>
    <a href=${link}></a><button>Link</button></a>
      
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
