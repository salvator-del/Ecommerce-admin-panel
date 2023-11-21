import multiparty from 'multiparty';
import {v2 as cloudinary} from 'cloudinary';
import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

export default async function handle(req,res) {
    await mongooseConnect();
    await isAdminRequest(req,res);

    const form = new multiparty.Form();
    const {fields,files} = await new Promise((resolve,reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({fields,files});
        });
    });
    console.log('length:', files.file.length);
    for (const file of files.file) {
        const ext = file.originalFilename.split('.').pop();
        console.log({ext,file});
        try {
            // Upload the image to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(file.path, {
                upload_preset: 'cloudinaryimages', // Set this up in your Cloudinary settings
            });
            
            // Send the uploaded image URL back to the frontend
            res.status(200).json({ imageURL: uploadResponse.secure_url });
        } 
        catch (error) {
            // Handle any errors that may occur during the upload process
            console.error('Error uploading image:', error);
            res.status(500).json({ error: 'Something went wrong during image upload' });
        }
    }
}

// Directive to enable manually parsing our request
export const config = {
    api: {bodyParser: false},
};
// import cloudinary from 'cloudinary';
// import multer from 'multer';

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET,
// });

// // Configure Multer
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Define the route handler
// export default async function handle(req, res) {
//   await mongooseConnect();
//   await isAdminRequest(req, res);

//   const { files } = await new Promise((resolve, reject) => {
//     upload.array('file')(req, res, (err) => {
//       if (err) reject(err);
//       resolve({ files: req.files });
//     });
//   });

//   const links = [];
//   for (const file of files) {
//     const result = await cloudinary.uploader.upload(file.buffer);
//     links.push(result.secure_url);
//   }

//   return res.json({ links });
// }
