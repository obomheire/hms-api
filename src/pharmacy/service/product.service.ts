import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, FilterQuery, Model, Types } from 'mongoose';
import { FilterPatientDto } from 'src/patients/dto/filterPatient.dto';
import {
  PatientDocument,
  PatientEntity,
} from 'src/patients/schema/patients.schema';
import { PatientsService } from 'src/patients/service/patients.service';
import {
  CreateRequestDto,
  PharmacyPrescriptionDto,
} from 'src/patients/dto/pharmacyPrescription.dto';
import { PrescriptionStatusEnum } from 'src/utils/enums/patients/prescriptionStatus.enum';
import {
  PharmacyPrescriptionDocument,
  PharmacyPrescriptionEntity,
} from 'src/patients/schema/pharmacyPrescription.schema';
import {
  DispensePrescription,
  ProductBatchDto,
  ProductBatchReturn,
} from '../dto/batch.dto';
import {
  CreateProductDto,
  ProductListDto,
  UpdateProductDto,
} from '../dto/product.dto';
import {
  ProductBatchEntity,
  ProductBatchDocument,
} from '../schema/batches.schema';
import {
  DrugProductDocument,
  DrugProductEntity,
} from '../schema/product.schema';
import e, { Request } from 'express';
import { PrescriptionService } from 'src/patients/service/precription.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RequisitionService } from './requisition.service';
import { AppNotificationService } from 'src/notification/service/socket-notification.service';
import { HospitalProfileService } from 'src/admin/service/hospital-address.service';
import { ProductOrderService } from './product-order.service';
import { ProductOrderEnum } from '../enum/product-order.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(DrugProductEntity.name)
    private readonly drugProductModel: Model<DrugProductDocument>,
    @InjectModel(ProductBatchEntity.name)
    private readonly batchModel: Model<ProductBatchDocument>,
    @InjectModel(PatientEntity.name)
    private readonly patientModel: Model<PatientDocument>,
    @InjectModel(PharmacyPrescriptionEntity.name)
    private readonly prescriptionModel: Model<PharmacyPrescriptionDocument>,
    private readonly patientsService: PatientsService,
    private readonly prescriptionService: PrescriptionService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly requisitionService: RequisitionService,
    private readonly appNotificationService: AppNotificationService,
    private readonly hospitalProfileService: HospitalProfileService,
    private readonly productOrderService: ProductOrderService,
  ) {}

  // We want to create a new product
  async createProduct(
    createProductDto: CreateProductDto,
    filename: Express.Multer.File,
  ): Promise<DrugProductDocument> {
    try {
      const newProduct = new this.drugProductModel(createProductDto);
      if (filename) {
        const uploadImage = await this.cloudinaryService.uploadImage(filename);
        newProduct.productImage = uploadImage.secure_url;
      }

      return await newProduct.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  // We want to get all products and be able to search through drug name, drug type(another entity referenced), generic name(another entity referenced) and brand name

  async getAllProducts(page = 1, limit = 15, search?: string) {
    try {
      if (search) {
        const products = await this.drugProductModel
          .find({
            $or: [
              { drugName: { $regex: search, $options: 'i' } },
              { brandName: { $regex: search, $options: 'i' } },
              { strength: { $regex: search, $options: 'i' } },
              {
                'genericName.activeIngredient': {
                  $regex: search,
                  $options: 'i',
                },
              },
              { 'drugType.name': { $regex: search, $options: 'i' } },
            ],
          })
          .populate('genericName')
          .populate('drugType')
          .skip((page - 1) * limit)
          .limit(limit)
          .exec();
        return products;
      } else {
        const products = await this.drugProductModel

          .find()
          .populate('genericName')
          .populate('drugType')
          .skip((page - 1) * limit)
          .limit(limit)
          .exec();

        // we want to get count
        const count = await this.drugProductModel.countDocuments().exec();
        const pages = Math.ceil(count / limit);
        const productsWithCount = {
          products,
          count,
          pages,
        };
        return productsWithCount;
      }
    } catch (error) {
      throw error;
    }
  }

  // We want to get a product by id
  async getOneProdcuct(id: string): Promise<DrugProductDocument> {
    try {
      const product = await this.drugProductModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We wanty to edit a product
  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.drugProductModel
        .findByIdAndUpdate(id, { $set: updateProductDto }, { new: true })
        .exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  // We want to delete a product
  async deleteProduct(id: string) {
    try {
      const product = await this.drugProductModel.findByIdAndDelete(id).exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //we want to bring in new batch of a product
  //we want to ensure the unit input for the batch is the same as the unit of the product
  //if the unit are the same, we want to add the quantity in the new batch to the totalQuantity of the product
  //we can have multiple products and batches at a time

  async addBatchToProduct(batch: ProductBatchDto[], id?: string) {
    //we want to create new batch of a product
    //we want to ensure the unit input for the batch is the same as the unit of the product
    //if the unit are the same, we want to add the quantity in the new batch to the totalQuantity of the product
    //we can have multiple products and batches at a time
    try {
      const batchArray = [];
      for (const item of batch) {
        // const product = await this.drugProductModel
        //   .findById(item.product)
        //   .exec();
        const product = await this.getOneProdcuct(item.product);
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        // if (product.unit !== item.unit) {
        //   throw new BadRequestException(
        //     'Unit of product and batch must be the same',
        //   );
        // }

        const newBatch = new this.batchModel({
          ...item,
          expiryDate: new Date(item.expiryDate).toISOString(),
        });
        const savedBatch = await newBatch.save();

        batchArray.push(savedBatch);

        product.availableQuantity += item.quantity;
        product.salesPrice = item.sellingPrice;
        product.purchasePrice = item.purchasePrice;
        await product.save();
        id ? await this.requisitionService.markAsFulfilled(id) : null;
      }
      return batchArray;
    } catch (error) {
      throw error;
    }
  }

  //get batches by product id

  async getBatchesByProduct(id: string, page = 1, limit = 15) {
    try {
      //we want to get all batches with same product id
      const batches = await this.batchModel
        .find({ product: id })
        .populate('product')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      if (!batches) {
        throw new NotFoundException('Batches not found');
      }
      const count = await this.batchModel.countDocuments({ product: id });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { batches, count, totalPages, currentPage };
    } catch (error) {
      throw error;
    }
  }

  //get single batch
  async getSingleBatch(id: string) {
    try {
      const batch = await this.batchModel.findById(id).exec();
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
      return batch;
    } catch (error) {
      throw error;
    }
  }

  //get expired batches of product
  //the expiryDAate is compared to the present date
  //if the expiryDate is less than the present date, the batch is considered expired

  async getAllExpiredProductBatches(
    page = 1,
    limit = 15,
  ): Promise<ProductBatchReturn> {
    try {
      const batches = await this.batchModel
        .find({
          expiryDate: {
            $lt: new Date().toISOString(),
          },
        })
        //populate the drugType in product
        .populate({
          path: 'product',
          populate: {
            path: 'drugType',
            model: 'DrugTypeEntity',
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!batches) {
        throw new NotFoundException('Batches not found');
      }
      const count = await this.batchModel.countDocuments({
        expiryDate: {
          $lt: new Date().toISOString(),
        },
      });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { batches, totalPages, currentPage, count };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //get all batches that are about to expire in 3 months BUT NOT EXPIRED YET AS AT PRESENT TIME

  async getAllExpiringProductBatches(
    page = 1,
    limit = 15,
  ): Promise<ProductBatchReturn> {
    try {
      const batches = await this.batchModel
        .find({
          expiryDate: {
            $gt: new Date().toISOString(),
            $lt: new Date(
              new Date().setMonth(new Date().getMonth() + 3),
            ).toISOString(),
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!batches) {
        throw new NotFoundException('Batches not found');
      }
      const count = await this.batchModel.countDocuments({
        expiryDate: {
          $gt: new Date().toISOString(),
          $lt: new Date(
            new Date().setMonth(new Date().getMonth() + 3),
          ).toISOString(),
        },
      });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { batches, totalPages, currentPage, count };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //get available products which are products with availableQuantity greater than 0

  async getAvailableProducts(search = '', page = 1, limit = 15) {
    try {
      const products = await this.drugProductModel
        .find({
          availableQuantity: {
            $gt: 0,
          },
          $or: [
            { drugName: { $regex: search, $options: 'i' } },
            { brandName: { $regex: search, $options: 'i' } },
          ],
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
      if (!products) {
        throw new NotFoundException('Products not found');
      }
      const count = await this.drugProductModel.countDocuments({
        availableQuantity: {
          $gt: 0,
        },
        $or: [
          { drugName: { $regex: search, $options: 'i' } },
          { brandName: { $regex: search, $options: 'i' } },
        ],
      });
      const totalPages = Math.ceil(count / limit);
      const currentPage = page;
      return { products, totalPages, currentPage, count };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async billPrescription(
    data: CreateRequestDto,
    // prescriptionId: string,
    req: any,
    // arbitraryQuantity?: number,
  ) {
    try {
      const { totalCost, isRefill, notes, status, patient, items } = data;

      let totalQuantity = 0;

      for (const item of items) {
        const batch = await this.batchModel
          .findById(item.batchId)
          .populate('product')
          .exec();
        if (!batch) {
          throw new NotFoundException('Batch not found');
        }
        let arbitraryQuantity = item.arbitraryQuantity
          ? item.arbitraryQuantity
          : 0;

        const drugFrequency = {
          OD: 24,
          BD: 12,
          TDS: 8,
          QDS: 6,
          QID: 4,
          QHS: 3,
          HS: 2,
          Q4H: 6,
          Q6H: 4,
          Q8H: 3,
          Q12H: 2,
          Q24H: 1,
        };

        if (!arbitraryQuantity) {
          const frequency = drugFrequency[item.frequency]
            ? drugFrequency[item.frequency] / 24
            : 1;
          const totalTimes = frequency * item.duration;
          const totalQuantity = totalTimes * item.amount;
          item.quantity = totalQuantity;
        } else {
          item.quantity = arbitraryQuantity;
          totalQuantity += item.quantity;
        }
        if (batch.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient quantity of product with ${batch.batchNumber} in stock`,
          );
        }
        batch.quantity -= item.quantity;
        batch.save();
        const product = await this.drugProductModel
          .findById(batch.product)
          .exec();
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        // product.availableQuantity -= item.quantity;
        product.save();
        // totalCost += batch.sellingPrice * item.quantity;
      }
      //create prescription here
      const prescription: any =
        await this.prescriptionService.createPrescription(
          { isRefill, notes, status, patient, items },
          req,
        );

      prescription.totalCost = totalCost;
      prescription.status = PrescriptionStatusEnum.BILLED;
      prescription.isRefill = isRefill;
      prescription.pharmacist = req.user;
      prescription.items = items;
      //we want to save the item.quantity in the prescription item
      // prescription.items = items.map((item) => {
      //   return {
      //     ...item,
      //     quantity: item.quantity,
      //   };
      // });
      prescription.save();
      await this.appNotificationService.createNotification({
        userId: patient as unknown as string,
        message: `New Prescription with unique code ${prescription?.uniqueCode} has been billed`,
        title: 'New Prescription',
        to: 'ACCOUNTS',
      });
      return prescription;
    } catch (error) {
      throw error;
    }
  }

  async createPescription(
    createPrescriptionDto: PharmacyPrescriptionDto,
    req: Request,
  ) {
    return await this.prescriptionService.createPrescription(
      createPrescriptionDto,
      req,
    );
  }

  //dispense existing preescription
  async dispenseExistingPrescription(
    id: string,
    data: CreateRequestDto,
    req: any,
  ) {
    // const { prescriptionId, batchId, arbitraryQuantity } = data;
    // const checkingArbitraryQuantity = data.items
    //   .map((item) => item.arbitraryQuantity)
    const { totalCost } = data;
    try {
      let prescription = await this.prescriptionModel
        .findById(id)
        .populate('patient', 'firstName lastName email phoneNumber')
        .populate('doctor', 'firstName lastName email phoneNumber')
        .exec();
      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }
      // if (prescription.status !== 'PAID') {
      //   throw new BadRequestException('Prescription has not been paid for yet');
      // }
      const items = prescription.items;
      // let totalCost = 0;
      let totalQuantity = 0;
      let finishedItems = [];

      for (const item of items) {
        //pick the product in the item
        const productCheck = await this.drugProductModel
          .findById(item.product)
          .exec();
        console.log(productCheck, 'productCheck');
        //if the product quantity is 0, return a message to tell the user that the product is out of stock
        if (productCheck.availableQuantity <= 0) {
          //push the item to the finishedItems array
          finishedItems.push(productCheck);
          //remove the item from the prescription
          prescription.items = prescription.items.filter(
            (item) => item.product !== productCheck.id,
          );
          //save the prescription
          // prescription.save();

          //continue to the next item
          continue;
        }
        //whenever the item is the same as the item in the item of the UpdatePharmacyPrescriptionDto, then check if arbitraryQuantity is provided there in the data of updatePharmacyPrescriptionDto
        let arbitraryQuantity: number = 0;
        let batch;
        for (const key of data.items) {
          if (key.product === item.product) {
            arbitraryQuantity = key.arbitraryQuantity;
          }
          batch = await this.batchModel.findById(key.batchId).exec();
        }

        // if (item.product === data.items.map((item) => item.product)) {
        //   arbitraryQuantity = item.arbitraryQuantity;
        // }
        //   //if arbitraryQuantity is provided, then use that to dispense the item

        // const batch = await this.batchModel
        //   .findById(batchId)
        //   .populate('product')
        //   .exec();

        // if (!batch) {
        //   throw new NotFoundException('Batch not found');
        // }

        const drugFrequency = {
          OD: 24,
          BD: 12,
          TDS: 8,
          QDS: 6,
          QID: 4,
          QHS: 3,
          HS: 2,
          Q4H: 6,
          Q6H: 4,
          Q8H: 3,
          Q12H: 2,
          Q24H: 1,
        };

        if (!arbitraryQuantity) {
          const frequency = drugFrequency[item.frequency]
            ? drugFrequency[item.frequency] / 24
            : 1;
          const totalTimes = frequency * item.duration;
          const totalQuantity = totalTimes * item.amount;
          item.quantity = totalQuantity;
        } else {
          item.quantity = arbitraryQuantity;
          totalQuantity += item.quantity;
        }
        if (batch.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient quantity of product with ${batch.batchNumber} in stock`,
          );
        }
        batch.quantity -= item.quantity;
        batch.save();
        const product = await this.drugProductModel
          .findById(batch.product)
          .exec();
        if (!product) {
          throw new NotFoundException('Product not found');
        }

        product.availableQuantity -= item.quantity;
        product.save();
        // totalCost += batch.sellingPrice * item.quantity;

        //we want to save the item.quantity to the prescription item

        // prescription.items = prescription.items.map((item) => {
        //   if (item.product === product.id){
        //     item.quantity = item.quantity
        //   }
        //   return item
        // })
        // prescription.save();
      }

      prescription.totalCost = totalCost;
      prescription.status = PrescriptionStatusEnum.BILLED;
      prescription.pharmacist = req.user;
      // prescription.isRefill = isRefill;
      //find by id and update the prescription with the new items
      await this.prescriptionModel
        .findByIdAndUpdate(id, { items: prescription.items }, { new: true })
        .exec();
      prescription.save();
      await this.appNotificationService.createNotification({
        userId: prescription.patient,
        message: `New Prescription with unique code ${prescription?.uniqueCode} has been billed`,
        title: 'New Prescription Billed',
        to: 'ACCOUNTS',
      });
      return { prescription, finishedItems };
    } catch (error) {
      throw error;
    }
  }

  // //dispense a prescription
  // async dispensePrescription(prescriptionId: string): Promise<any> {
  //   try {
  //     const prescription: any = await this.prescriptionModel
  //       .findById(prescriptionId)
  //       // //populate drugType in the items
  //       // .populate({
  //       //   path: 'items',
  //       //   populate: {
  //       //     path: 'product',
  //       //     populate: {
  //       //       path: 'drugType',
  //       //       model: 'DrugType'
  //       //     }
  //       //   }
  //       // })
  //       .exec();
  //     if (!prescription) {
  //       throw new NotFoundException('Prescription not found');
  //     }
  //     if(prescription.status === 'DISPENSED'){
  //       throw new BadRequestException('Prescription has already been dispensed');
  //     }
  //     if (prescription.status !== 'PAID') {
  //       throw new BadRequestException('Prescription has not been paid for yet');
  //     }
  //     //if prescription.isIndividual is true, then we want to dispense the prescription, and deduct the quantity from the availableQuantity of the product

  //     const items = prescription.items;
  //     if(prescription.isIndividual){
  //       for (const item of items) {
  //         const product = await this.drugProductModel
  //           .findById(item.product)
  //         console.log(product, 'product');
  //         product.availableQuantity -= item.quantity;
  //         product.save();
  
  //         //then we want to calculate numberOfTimes the drug is to be taken using Math.floor of item.quantity divided by item.amount
  
  //         // //then we want to calculate the frequency of the drug using Math.floor of 24 divided by drugFrequency[item.frequency]
         
  //       }
  //       prescription.status = PrescriptionStatusEnum.DISPENSED;
  //     prescription.dispensedDate = new Date();
  //     }



     
  //     for (const item of items) {
  //       const product = await this.drugProductModel
  //         .findById(item.product)
  //         .populate('drugType')
  //         .populate('genericName');
  //       console.log(product, 'product');
  //       // .populate('drugType')
  //       // product.availableQuantity -= item.quantity;
  //       product.save();

  //       //then we want to calculate numberOfTimes the drug is to be taken using Math.floor of item.quantity divided by item.amount

  //       // //then we want to calculate the frequency of the drug using Math.floor of 24 divided by drugFrequency[item.frequency]
  //       const drugFrequency = {
  //         OD: 1,
  //         BD: 2,
  //         TDS: 3,
  //         QDS: 4,
  //         QID: 6,
  //         QHS: 8,
  //         HS: 12,
  //         Q4H: 4,
  //         Q6H: 6,
  //         Q8H: 3,
  //         Q12H: 2,
  //         Q24H: 1,
  //       };
  //       const frequency = drugFrequency[item.frequency]
  //         ? drugFrequency[item.frequency]
  //         : 1;
  //       const numberOfTimes = Math.floor(
  //         item.quantity / frequency / item.amount,
  //       );

  //       item.numberOfTimes = numberOfTimes;
  //       item.nextDose = new Date();

  //       const check = await this.prescriptionService.generateDosesForDrugItem(
  //         item,
  //         prescription?.patient,
  //         product,
  //       );
  //       console.log(check, 'check');
  //     }
  //     console.log(items, 'items');

  //     prescription.status = PrescriptionStatusEnum.DISPENSED;
  //     prescription.dispensedDate = new Date();
  //     //find by id and update the prescription with the new items
  //     await this.prescriptionModel
  //       .findByIdAndUpdate(
  //         prescriptionId,
  //         { items: prescription.items },
  //         { new: true },
  //       )
  //       .exec();

  //     prescription.save();
  //     return prescription;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }



  async dispensePrescription(prescriptionId: string): Promise<any> {
    try {
      const prescription: any = await this.prescriptionModel
        .findById(prescriptionId)
        .populate({
          path: 'items.product',
          populate: [
            { path: 'drugType' },
            { path: 'genericName' },
          ],
        })
        .exec();
  
      if (!prescription) {
        throw new NotFoundException('Prescription not found');
      }
  
      if (prescription.status === PrescriptionStatusEnum.DISPENSED) {
        throw new BadRequestException('Prescription has already been dispensed');
      }
  
      if (prescription.status !== PrescriptionStatusEnum.PAID) {
        throw new BadRequestException('Prescription has not been paid for yet');
      }
  
      const items = prescription.items;
  
      if (prescription.isIndividual) {
        for (const item of items) {
          const product = await this.drugProductModel.findById(item.product);
          product.availableQuantity -= item.quantity;
          await product.save();
        }
        prescription.status = PrescriptionStatusEnum.DISPENSED;
        prescription.dispensedDate = new Date();
        return await prescription.save();
      }
  
      for (const item of items) {
        const product = await this.drugProductModel
          .findById(item.product)
          .populate('drugType')
          .populate('genericName');
  
        const drugFrequency = {
          OD: 1,
          BD: 2,
          TDS: 3,
          QDS: 4,
          QID: 6,
          QHS: 8,
          HS: 12,
          Q4H: 4,
          Q6H: 6,
          Q8H: 3,
          Q12H: 2,
          Q24H: 1,
        };
  
        const frequency = drugFrequency[item.frequency] || 1;
        const numberOfTimes = Math.floor(item.quantity / (frequency * item.amount));
  
        item.numberOfTimes = numberOfTimes;
        item.nextDose = new Date();
  
        await this.prescriptionService.generateDosesForDrugItem(item, prescription?.patient, product);
      }
  
      prescription.status = PrescriptionStatusEnum.DISPENSED;
      prescription.dispensedDate = new Date();
  
      const updatedPrescription = await this.prescriptionModel
        .findByIdAndUpdate(
          prescriptionId,
          { items: prescription.items, status: prescription.status, dispensedDate: prescription.dispensedDate },
          { new: true },
        )
        .exec();
  
      // await updatedPrescription.save();
      return updatedPrescription;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  


  

  async dispenseProductOrder(id: string, userId: string) {
    try {
      const productOrder = await this.productOrderService.findOne(id);
      if (!productOrder) {
        throw new NotFoundException('Product Order not found');
      }
      if (productOrder.status === ProductOrderEnum.DISPENSED) {
        throw new BadRequestException(
          'Product Order has already been dispensed',
        );
      }
      if (productOrder.status !== ProductOrderEnum.PAID) {
        throw new BadRequestException(
          'Product Order has not been paid for yet',
        );
      }
      const items = productOrder.items;
      for (const item of items) {
        const product = await this.drugProductModel
          .findById(item.product)
          .exec();
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        product.availableQuantity -= item.quantity;
        product.save();
      }
      const response = await this.productOrderService.update(id, {
        status: ProductOrderEnum.DISPENSED,
        dispensedDate: new Date().toISOString(),
        dispensedBy: userId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getPrescription(id: string) {
    return await this.prescriptionService.getPrescription(id);
  }

  async getAllPrescriptions(data?: FilterPatientDto) {
    return await this.prescriptionService.getAllPrescriptions(data);
  }

  async getPendingRequests(data?: FilterPatientDto) {
    return await this.prescriptionService.getPendingPrescriptions(data);
  }

  async getCompletedRequests(data?: FilterPatientDto) {
    return await this.prescriptionService.getCompletedPrescriptions(data);
  }

  async updatePrescription(
    id: string,
    updatePrescriptionDto: PharmacyPrescriptionDto,
  ) {
    return await this.prescriptionService.updatePrescription(
      id,
      updatePrescriptionDto,
    );
  }

  async deletePrescription(id: string) {
    return await this.prescriptionService.deletePrescription(id);
  }

  async getPrescriptionsForDoctor(id: string, filter?: FilterPatientDto) {
    return await this.prescriptionService.getPrescriptionsForDoctor(id, filter);
  }

  //GET TOTAL NUMBER OF DISPENSED PRESCRIPTIONS
  async getTotalDispensedPrescriptions() {
    try {
      return await this.prescriptionModel.countDocuments({
        status: 'DISPENSED',
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getProductList(data: ProductListDto) {
    try {
      // Prepare the query to filter and search products
      const { search, page, limit, drugType } = data;
      const query = {
        availableQuantity: { $gt: 0 },
      };

      if (search) {
        query['$or'] = [
          { drugName: { $regex: search, $options: 'i' } },
          { brandName: { $regex: search, $options: 'i' } },
        ];
      }

      if (drugType) {
        query['drugType'] = drugType;
      }

      // Fetch the products with drugType populated, sorted by drugType name
      const products = await this.drugProductModel
        .find(query)
        .populate('drugType', 'name') // Only populate the 'name' field from drugType
        .sort({ 'drugType.name': 1 }) // Sort by drugType name in ascending order
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      if (!products || products.length === 0) {
        throw new NotFoundException('Products not found');
      }

      // Get the total count of matching products for pagination
      const count = await this.drugProductModel.countDocuments(query);

      // Calculate the total number of pages
      const totalPages = Math.ceil(count / limit);
      const address = await this.hospitalProfileService.getHospitalProfile();

      // Return the paginated result along with total pages and current page
      return { products, totalPages, currentPage: page, count, address };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

/*
async dispensePrescription(
  data: DispenseDto,
): Promise<any> {
  try {
    const { item, prescriptionId, isRefill } = data;
    const prescription = await this.prescriptionModel.findById
    (prescriptionId).exec();
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    if (prescription.status !== 'PENDING') {
      throw new BadRequestException('Prescription already dispensed');
    }
    let totalCost = 0;
    let totalQuantity = 0;
    let totalPayable = 0;
    const batchArray = [];
//we loop through the products in the prescription
      for (const sub of item) {
        for (const item of prescription.prescription) {
          if (item.product === sub.product) {
            //we get the batch of the product
            const batch = await this.batchModel.findById
      }
*/

/*
const batch = await this.batchModel.findById(item.batchId).exec();
        if (!batch) {
          throw new NotFoundException('Batch not found');
        }
        const product = await this.drugProductModel.findById
        (batch.product).exec();
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        if (batch.quantity < item.quantity) {
          throw new BadRequestException('Quantity not available');
        }
        if (item.quantity > 0) {
          batch.quantity -= item.quantity;
          totalQuantity += item.quantity;
          totalCost += item.quantity * batch.sellingPrice;
          totalPayable += item.quantity * batch.sellingPrice;
          await batch.save();
          batchArray.push(batch);
        }
        //if item.quantity is not provided, totalQuantity is calculated by duration, frequency and amount of each product in the prescription's prescription field
        else {
          const { duration, frequency, amount } = item;
          const quantity = duration * frequency * amount;
          batch.quantity -= quantity;
          totalQuantity += quantity;
          totalCost += quantity * batch.sellingPrice;
          totalPayable += quantity * batch.sellingPrice;
          await batch.save();
          batchArray.push(batch);
        }
        


      }

*/
