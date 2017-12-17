import amazon from 'amazon-product-api'
import babelPolyfill from 'babel-polyfill'
import babelCoreRegister from 'babel-core/register'

export default class AmazonAPI {
   constructor() {
     this.client = amazon.createClient({
        awsId: "AKIAIBVPWTULTMELFMDQ",
        awsSecret: "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",
        awsTag: "faf151-20"
      });
   }


   search(maxPrice, minPrice, keyword) {
       if(keyword === undefined) {
         keyword = "Product"
       }

      return new Promise((resolve, reject) => {
        this.client.itemSearch({
         keywords: keyword,
         maximumPrice: maxPrice,
         minimumPrice: minPrice,
         searchIndex: 'All'
       }, (err, results, response) => {
            resolve(results)
       })
     })
   }
}
