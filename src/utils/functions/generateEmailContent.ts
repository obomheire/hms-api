import { GenerateEmailContentDto } from "../dtos/generateEmailContent.dto";

export function generateEmailContent ( data: GenerateEmailContentDto): string {

    const { fullname, link, content } = data;
    const { email, staffId, password } = content;
    return `
        Hello ${fullname}
        Welcome to our organization. Your staff account has been created and the login details are as follows:
        email: ${email}
        staffId: ${staffId}
        password: ${password}
	
	    Kind Regards, Heckercare
	
    `
}
