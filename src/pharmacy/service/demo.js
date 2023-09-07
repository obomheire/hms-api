//  // We want to create a new product
//   async createProduct(
//     createProductDto: CreateProductDto,
//   ): Promise<DrugProductDocument> {
//     try {
//       const product = new this.drugProductModel(createProductDto);
//       const res = await product.save();
//       return res;
//     } catch (error) {
//       throw new InternalServerErrorException(error);
//     }
//   }

// // We want to create a new product
//   @Post('create')
//   async createProduct(@Body() product: CreateProductDto) {
//     return await this.productService.createProduct(product);
//   }

//   @Post('create')
//   async createProduct(@Body() product: CreateProductDto, request: Request) {
//     return await this.productService.createProduct(product, request);
//   }