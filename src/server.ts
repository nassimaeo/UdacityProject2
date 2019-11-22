import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get( "/filteredimage", async ( req, res ) => {

    // retrieve and validate the url_image from the query
    let { image_url } = req.query;
    if ( !image_url ) {
      return res.status(400).send(`image_url is required`);
    }

    // UNCOMMENT this if you want to see the original image (resized)
    //return res.status(200).send(`Image ${image_url}! <img width="200" height="200" src="${image_url}"/>`);

    // filter the image
    const pathToLocalImagePromise: Promise<string> = filterImageFromURL(image_url);

    // send the filtered image in the response
    pathToLocalImagePromise.then((result) => {
      res.status(200).sendFile(result);

      // delete the file after treatment and after being sent
      res.on("finish", ()=>{
        let arrayFiles : Array<string> = new Array<string>();
        arrayFiles.push(result);
        deleteLocalFiles(arrayFiles);
      });

      return res;
    });

    // handle the error case 
    //there is not reject function call in filterImageFromURL, so this is never called
    pathToLocalImagePromise.catch((error) => {
      return res.status(422).send("Error handling your file "+ image_url +" ERROR: " + error);
    });
    
  });
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();