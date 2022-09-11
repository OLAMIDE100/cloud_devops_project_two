import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import validator from "validator";

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  app.get( "/filteredimage", async (req:express.Request,res:express.Response ) => {

    const imageUrl:string = req.query.image_url;

    // check imageUrl is not empty
    if (!imageUrl) {
      return res.status(400).send({
        success: false,
        message: `The image_url query parameter is required.`
      });
    }

    // check imageUrl is valid
    if (!validator.isURL(imageUrl)) {
      return res.status(400).send({
        success: false,
        message: `image url is not valid`,
      });
    }

    try {
      const filteredImagePath:string = await filterImageFromURL(imageUrl);
      const sendFileOptions = {};

      res.sendFile(filteredImagePath, sendFileOptions, async (error: Error) => {
        // status: 200
        deleteLocalFiles([filteredImagePath]);
        if (error) {
          res.status(500).send({
            success: false,
            message: 'An error occurred while returning the filtered image.',
            detail: `${error}`,
          });
        }
      });
    } catch (error) {
      // Possible exceptions:
      // * Promise.reject() throws an exception (filterImageFromURL -> jimp functions (read, write etc.))

      res.status(500).send({
        success: false,
        message: `processing image error.`,
        detail: `${error}`,
      });
    }
    
    
  
  });
    
  app.get( "/", async ( req, res ) => {
    res.send("Main Page")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();