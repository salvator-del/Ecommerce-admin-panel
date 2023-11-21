import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "./Spinner";
import {ReactSortable} from "react-sortablejs";
import { Result } from "postcss";


export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images:existingImages,
    category:assignedCategory,
    properties:assignedProperties,
}) {
    const [title,setTitle] = useState(existingTitle || '');
    const [description,setDescription] = useState(existingDescription || '');
    const [category,setCategory] = useState(assignedCategory || '');
    const [productProperties,setProductProperties] = useState(assignedProperties || {});
    const [price,setPrice] = useState(existingPrice || '');
    const [images,setImages] = useState(existingImages || []);
    const [isUploading,setIsUploading] = useState(false);
    const [goToProducts,setGoToProducts] = useState(false);
    const [categories,setCategories] = useState([]);
    const router = useRouter();
    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }, []);
    async function saveProduct(ev) {
        ev.preventDefault();
        const data = {title,description,price,images,category,properties:productProperties};
        if (_id) {
            //update
            await axios.put('/api/products', {...data,_id});
        } else {
            //create i guess
            await axios.post('/api/products', data);
        }
        setGoToProducts(true);
    }
    if (goToProducts) {
        router.push('/products');
    }
    // async function uploadImages(ev) {
    //     const files = ev.target?.files;
    //     if (files?.length > 0) {
    //         const data = new FormData();
    //         for (const file of files) {
    //             data.append('file', file);
    //         }
    //         const res = await axios.post('/api/upload', data);
            
    //     }
    // }

    // Function to upload images to cloudinary cloud
    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
          const data = new FormData();
          const links = [];
          for (const file of files) {
            data.append('file', file);
            data.append('upload_preset', 'cloudinaryimages')
            data.append('cloud_name', process.env.CLOUDINARY_NAME)
          }
          await axios.post('https://api.cloudinary.com/v1_1/dceghgkxi/image/upload', data)
            .then(res => res.data)
            .then(data => {
              links.push(data.url);
              setImages(oldImages => [...oldImages, ...links]);
            });
            setIsUploading(false);
        } else {
          err => console.log(err)  
        }
    }

    function updateImagesOrder(images) {
        setImages(images);
    }
    function setProductProp(propName,value) {
        setProductProperties(prev => {
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps;
        })
    }

    const propertiesToFill = []; //Defining array
    if (categories.length > 0 && category) {
        //Finding selected category and looping through categories to find catefories where _id is the same as selected
        let catInfo = categories.find(({_id}) => _id === category);
        //grabbing selected properties and pushing it to propertiesToFill
        propertiesToFill.push(...catInfo.properties);

        //while loop for checking if selected category has any parent id
        //if it has a parent, we find information about it and if it has any properties that we then add to our array
        while(catInfo?.parent?._id) {
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            catInfo = parentCat;
        }
    }
      
    
    return (
        <form onSubmit={saveProduct}>
            <label>Product name</label>
            <input 
            type="text" 
            placeholder="product name"
            value={title} 
            onChange={ev => setTitle(ev.target.value)}
            />
            <label>Category</label>
            <select value={category}
                    onChange={ev => setCategory(ev.target.value)}>
                <option value="">Uncategorized</option>
                {categories.length > 0 && categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                ))}
            </select>
            {propertiesToFill.length > 0 && propertiesToFill.map(p => (
                <div className="">
                    <div>{p.name[0].toUpperCase()+p.name.substring(1)}</div>
                    <div>
                        <select value={productProperties[p.name]} onChange={ev => setProductProp(p.name,ev.target.value)}>
                            {p.values.map(v => (
                                <option value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
            <label>Photos</label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable 
                    list={images}
                    className="flex flex-wrap gap-1" 
                    setList={updateImagesOrder}>
                    {!!images?.length && images.map(url => (
                        <div key={url} className="h-24 bg-white p-2 shadow-md rounded-md border border-gray-300">
                            <img src={url} alt="" className="rounded-lg"/>
                        </div>
                    ))}
                </ReactSortable>
                {isUploading && (
                    <div className="h-24 p-1 flex items-center">
                        <Spinner/>
                    </div>
                )}
                <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-gray-500 rounded-sm text-primary bg-white shadow-sm border border-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>Add image</div>
                    <input type="file" onChange={uploadImages} className="hidden"/>
                    {/* {images.map((image, index) => (
                        <img key={index} src={image} alt={`Image ${index}`} />
                    ))} */}

                    
                </label>
            </div>
            <label>Description</label>
            <textarea 
            placeholder="description" 
            value={description} 
            onChange={ev => setDescription(ev.target.value)}
            />
            <label>Price (in KSH)</label>
            <input 
            type="number" 
            placeholder="price" 
            value={price} 
            onChange={ev => setPrice(ev.target.value)}
            />
            <button type="submit" className="btn-primary">
                Save
            </button>
        </form>
    );
}