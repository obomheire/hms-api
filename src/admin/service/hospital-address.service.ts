import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { HospitalAddressDocument, HospitalAddressEntity } from "../schema/hospital-profile.schema";

@Injectable()
export class HospitalProfileService {
  constructor(
    @InjectModel(HospitalAddressEntity.name)
    private readonly followUpModel: Model<HospitalAddressDocument>,
    private readonly cloudinaryService: CloudinaryService
  
  ) {}

    async createHospitalProfile(hospitalProfile: Partial<HospitalAddressEntity>,  filename?: Express.Multer.File,): Promise<HospitalAddressDocument> {
        const newHospitalProfile = new this.followUpModel(hospitalProfile);
        if(filename) {
            const { secure_url } = await this.cloudinaryService.uploadImage(filename);
            hospitalProfile.picture = secure_url;
        }
        newHospitalProfile.picture = hospitalProfile.picture;
        return await newHospitalProfile.save();
    }

    async getHospitalProfile(): Promise<HospitalAddressDocument[]> {
        return await this.followUpModel.find()
    }

    async getHospitalProfileById(id: string): Promise<HospitalAddressDocument> {
        return await this.followUpModel.findById(id).exec();
    }

    async updateHospitalProfile(hospitalProfile: Partial<HospitalAddressEntity>, id: string, filename?: Express.Multer.File): Promise<HospitalAddressDocument> {
        if(filename) {
            const { secure_url } = await this.cloudinaryService.uploadImage(filename);
            hospitalProfile.picture = secure_url;
        }
        return await this.followUpModel.findByIdAndUpdate(id, hospitalProfile, { new: true });

    }

}