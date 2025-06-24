import React, { useState, useCallback, useEffect } from "react";
import { getDatabase, ref, set, serverTimestamp, update } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "../../../firebase";
import { useLocation, useNavigate } from "react-router-dom";

const db = getDatabase(app);
const storage = getStorage(app);

const AddProductForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vendorBusinessName = localStorage.getItem("vendorBusiness");
  const vendorEmail = localStorage.getItem("vendorEmail");
  const productToEdit = location.state?.productToEdit;
  const isEditMode = !!productToEdit;

  const categories = [
    { value: "ready-mix-concrete", label: "Ready-Mix Concrete" },
    { value: "cement", label: "Cement" },
    { value: "bricks", label: "Bricks" },
    { value: "tiles", label: "Tiles" },
    { value: "steel", label: "Steel" },
    { value: "tools", label: "Tools" },
    { value: "paint", label: "Paint" },
    { value: "electrical", label: "Electrical" },
    { value: "plumbing", label: "Plumbing" },
    { value: "furniture", label: "Furniture" },
  ];

  const [formData, setFormData] = useState({
    category: "",
    productName: "",
    brand: "",
    brickType: "",
    color: "",
    quantities: [
      {
        length: "",
        width: "",
        quantity: "",
        unit: "piece",
        sellingPrice: "",
        mrp: "",
      },
    ],
    description: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEditMode && productToEdit) {
      const { categoryKey, productName, brand, typeOfBrick, color, description, variants, images } = productToEdit;
      
      let quantities = [];
      if (variants && variants.length > 0) {
        quantities = variants.map(variant => ({
          length: variant.length_mm || "",
          width: variant.width_mm || "",
          quantity: variant.quantity || "",
          unit: variant.unit || "piece",
          sellingPrice: variant.sellingPrice || "",
          mrp: variant.mrp || "",
        }));
      } else {
        quantities = [{
          quantity: productToEdit.quantity || "",
          unit: productToEdit.unit || "piece",
          sellingPrice: productToEdit.sellingPrice || "",
          mrp: productToEdit.mrp || "",
          length: "",
          width: "",
        }];
      }

      setFormData({
        category: categoryKey,
        productName,
        brand: brand || "",
        brickType: typeOfBrick || "",
        color: color || "",
        quantities,
        description: description || "",
        images: [],
      });

      if (images) {
        setExistingImages(images);
        setImagePreviews(images);
      }
    }
  }, [isEditMode, productToEdit]);

  const validateProductName = (name) => {
    const invalidChars = ['.', '$', '#', '[', ']', '/'];
    const hasInvalidChars = invalidChars.some(char => name.includes(char));
    
    if (hasInvalidChars) {
      return {
        isValid: false,
        message: `Product name cannot contain these characters: . $ # [ ] /`
      };
    }
    
    if (name.trim().length === 0) {
      return {
        isValid: false,
        message: 'Product name is required'
      };
    }
    
    return { isValid: true };
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      category: value,
      productName: "",
      brand: "",
      brickType: "",
      color: "",
      quantities: [
        {
          length: "",
          width: "",
          quantity: "",
          unit: "piece",
          sellingPrice: "",
          mrp: "",
        },
      ],
      description: "",
      images: [],
    });
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'productName') {
      const validation = validateProductName(value);
      if (!validation.isValid) {
        setError(validation.message);
      } else if (error && error.includes('Product name cannot contain')) {
        setError(null);
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleQuantityChange = (index, e) => {
    const { name, value } = e.target;
    const newQuantities = [...formData.quantities];
    newQuantities[index] = { ...newQuantities[index], [name]: value };
    setFormData({ ...formData, quantities: newQuantities });
  };

  const addQuantityField = () => {
    setFormData({
      ...formData,
      quantities: [
        ...formData.quantities,
        {
          length: "",
          width: "",
          quantity: "",
          unit: "piece",
          sellingPrice: "",
          mrp: "",
        },
      ],
    });
  };

  const removeQuantityField = (index) => {
    const newQuantities = formData.quantities.filter((_, i) => i !== index);
    setFormData({ ...formData, quantities: newQuantities });
  };

  const handleFiles = useCallback((files) => {
    const validFiles = files.filter(
      (file) => file.type.match("image.*") && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length === 0) {
      setError(
        "No valid images selected. Ensure files are images and under 5MB."
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    setImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files).filter((file) =>
          file.type.match("image.*")
        );
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setImagesToDelete([...imagesToDelete, existingImages[index]]);
      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
      
      const newPreviews = [...imagePreviews];
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    } else {
      const adjustedIndex = index - existingImages.length;
      const newImages = [...formData.images];
      newImages.splice(adjustedIndex, 1);
      setFormData({ ...formData, images: newImages });

      const newPreviews = [...imagePreviews];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    }
  };

  const uploadImages = async (images, productId) => {
    if (!productId) {
      throw new Error("Invalid product ID");
    }
    if (!images.every((image) => image.name)) {
      throw new Error("One or more images are missing a valid name");
    }

    const imageUrls = [];
    for (const image of images) {
      try {
        const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const timestamp = Date.now();
        const imageRef = storageRef(
          storage,
          `Vendors/${vendorBusinessName}/Products/${formData.category}/${productId}/${timestamp}_${sanitizedFileName}`
        );
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        throw new Error(
          `Failed to upload image ${image.name}: ${uploadError.message}`
        );
      }
    }
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!vendorBusinessName) {
        throw new Error(
          "Vendor business name is missing. Please ensure you are logged in as a vendor."
        );
      }

      const nameValidation = validateProductName(formData.productName);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }

      if (!formData.productName) {
        throw new Error("Product name is required");
      }
      if (
        [
          "cement",
          "paint",
          "tiles",
          "electrical",
          "plumbing",
          "furniture",
        ].includes(formData.category) &&
        !formData.brand
      ) {
        throw new Error("Brand is required for this category");
      }
      if (formData.category === "bricks" && !formData.brickType) {
        throw new Error("Brick type is required");
      }
      if (
        formData.quantities.some(
          (qty) => !qty.quantity || !qty.sellingPrice || !qty.mrp
        )
      ) {
        throw new Error(
          "All quantity, selling price, and MRP fields are required"
        );
      }
      if (
        formData.category === "tiles" &&
        formData.quantities.some((qty) => !qty.length || !qty.width)
      ) {
        throw new Error("Length and width are required for tiles");
      }
      if (formData.category === "paint" && !formData.color) {
        throw new Error("Color is required for paint");
      }

      let productData = {
        category:
          categories.find((cat) => cat.value === formData.category)?.label ||
          formData.category,
        productName: formData.productName,
        description: formData.description || "",
        vendorEmail: vendorEmail || "",
        vendorBusinessName: vendorBusinessName || "",
      };

      if (
        [
          "ready-mix-concrete",
          "cement",
          "steel",
          "tools",
          "paint",
          "tiles",
          "electrical",
          "plumbing",
          "furniture",
        ].includes(formData.category)
      ) {
        productData.brand = formData.brand;
      }
      if (formData.category === "bricks") {
        productData.typeOfBrick = formData.brickType;
      }

      if (["electrical", "plumbing", "furniture"].includes(formData.category)) {
        productData.mrp = parseFloat(formData.quantities[0].mrp) || 0;
        productData.sellingPrice =
          parseFloat(formData.quantities[0].sellingPrice) || 0;
        productData.quantity = parseInt(formData.quantities[0].quantity) || 0;
        productData.unit = formData.quantities[0].unit || "piece";
      } else {
        productData.variants = formData.quantities.map((qty) => {
          const variant = {
            quantity: parseInt(qty.quantity) || 0,
            unit: qty.unit || "piece",
            sellingPrice: parseFloat(qty.sellingPrice) || 0,
            mrp: parseFloat(qty.mrp) || 0,
          };
          if (formData.category === "tiles") {
            variant.length_mm = parseInt(qty.length) || 0;
            variant.width_mm = parseInt(qty.width) || 0;
          }
          if (formData.category === "paint") {
            productData.color = formData.color || "";
          }
          return variant;
        });
      }

      const productId = formData.productName.trim();
      const productRef = ref(
        db,
        `Vendors/${vendorBusinessName}/Products/${formData.category}/${isEditMode ? productToEdit.id : productId}`
      );

      let imageUrls = [...existingImages];
      
      if (imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map(async (imageUrl) => {
            try {
              const imageRef = storageRef(storage, imageUrl);
              await deleteObject(imageRef);
              imageUrls = imageUrls.filter(url => url !== imageUrl);
            } catch (err) {
              console.error("Error deleting image:", err);
            }
          })
        );
      }

      if (formData.images.length > 0) {
        const newImageUrls = await uploadImages(formData.images, isEditMode ? productToEdit.id : productId);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      if (imageUrls.length > 0) {
        productData.images = imageUrls;
      } else if (isEditMode) {
        productData.images = [];
      }

      if (isEditMode) {
        await update(productRef, productData);
        setSuccess("Product updated successfully!");
        setTimeout(() => {
        navigate('/vendor/products/view');
        }, 1500);
      } else {
        await set(productRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
        setSuccess("Product added successfully!");
      }

      if (!isEditMode) {
        setFormData({
          category: "",
          productName: "",
          brand: "",
          brickType: "",
          quantities: [
            {
              length: "",
              width: "",
              quantity: "",
              unit: "piece",
              sellingPrice: "",
              mrp: "",
              color: "",
            },
          ],
          description: "",
          images: [],
        });
        setImagePreviews([]);
        setExistingImages([]);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message || "Failed to save product. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const renderTileSizeFields = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-amber-800 text-sm font-bold">
            Size & Pricing
          </label>
          <button
            type="button"
            onClick={addQuantityField}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition-colors"
          >
            + Add Size Variant
          </button>
        </div>
        {formData.quantities.map((qty, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 mb-3 items-end">
            <div>
              <label className="block text-amber-700 text-xs mb-1">
                Length (mm)
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="length"
                type="number"
                value={qty.length || ""}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              />
            </div>
            <div>
              <label className="block text-amber-700 text-xs mb-1">
                Width (mm)
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="width"
                type="number"
                value={qty.width || ""}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              />
            </div>
            <div>
              <label className="block text-amber-700 text-xs mb-1">
                Quantity
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="quantity"
                type="number"
                value={qty.quantity}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              />
            </div>
            <div>
              <label className="block text-amber-700 text-xs mb-1">
                Unit
              </label>
              <select
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="unit"
                value={qty.unit}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              >
                <option value="piece">Piece</option>
                <option value="box">Box</option>
                <option value="sqm">Square Meter</option>
                <option value="sqft">Square Foot</option>
                <option value="set">Set</option>
              </select>
            </div>
            <div>
              <label className="block text-amber-700 text-xs mb-1">
                Selling Price
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="sellingPrice"
                type="number"
                value={qty.sellingPrice}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              />
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <label className="block text-amber-700 text-xs mb-1">MRP</label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  name="mrp"
                  type="number"
                  value={qty.mrp}
                  onChange={(e) => handleQuantityChange(index, e)}
                  required
                />
              </div>
              {formData.quantities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuantityField(index)}
                  className="ml-2 text-red-500 hover:text-red-700 bg-red-50 rounded-full p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuantityFields = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-amber-800 text-sm font-bold">
            Quantity & Pricing
          </label>
          <button
            type="button"
            onClick={addQuantityField}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition-colors"
          >
            + Add More
          </button>
        </div>
        {formData.quantities.map((qty, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 mb-3 items-end">
            <div>
              <label className="block text-amber-700 text-xs mb-1">
                Quantity
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="quantity"
                type="number"
                value={qty.quantity}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              />
            </div>
            <div>
              <label className="block text-amber-700 text-xs mb-1">Unit</label>
              <select
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="unit"
                value={qty.unit}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              >
                <option value="">Select</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="piece">piece</option>
                <option value="box">box</option>
                <option value="bag">bag</option>
                <option value="set">set</option>
                <option value="meter">meter</option>
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="feet">feet</option>
                <option value="inch">inch</option>
                <option value="yard">yard</option>
                <option value="sqm">sqm (square meter)</option>
                <option value="sqft">sqft (square feet)</option>
                <option value="cubic-meter">cubic meter</option>
                <option value="cubic-foot">cubic foot</option>
                <option value="ton">ton</option>
                <option value="roll">roll</option>
                <option value="pair">pair</option>
                <option value="dozen">dozen</option>
                <option value="pack">pack</option>
                <option value="bundle">bundle</option>
              </select>
            </div>
            <div>
              <label className="block text-amber-700 text-xs mb-1">
                Selling Price
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                name="sellingPrice"
                type="number"
                value={qty.sellingPrice}
                onChange={(e) => handleQuantityChange(index, e)}
                required
              />
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <label className="block text-amber-700 text-xs mb-1">MRP</label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  name="mrp"
                  type="number"
                  value={qty.mrp}
                  onChange={(e) => handleQuantityChange(index, e)}
                  required
                />
              </div>
              {formData.quantities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuantityField(index)}
                  className="ml-2 text-red-500 hover:text-red-700 bg-red-50 rounded-full p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPaintQuantityFields = () => {
    return (
      <>
        <div className="mb-4">
          <label
            className="block text-amber-800 text-sm font-bold mb-2"
            htmlFor="color"
          >
            Color
          </label>
          <input
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            name="color"
            type="text"
            value={formData.color}
            onChange={handleInputChange}
            placeholder="e.g., Royal Blue"
            required
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-amber-800 text-sm font-bold">
              Quantity & Pricing
            </label>
            <button
              type="button"
              onClick={addQuantityField}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition-colors"
            >
              + Add More
            </button>
          </div>

          {formData.quantities.map((qty, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-3 items-end">
              <div>
                <label className="block text-amber-700 text-xs mb-1">
                  Quantity
                </label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  name="quantity"
                  type="number"
                  value={qty.quantity}
                  onChange={(e) => handleQuantityChange(index, e)}
                  required
                />
              </div>
              <div>
                <label className="block text-amber-700 text-xs mb-1">
                  Unit
                </label>
                <select
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  name="unit"
                  value={qty.unit}
                  onChange={(e) => handleQuantityChange(index, e)}
                  required
                >
                  <option value="">Select</option>
                  <option value="liter">Liter</option>
                  <option value="gallon">Gallon</option>
                  <option value="bucket">Bucket</option>
                  <option value="can">Can</option>
                </select>
              </div>
              <div>
                <label className="block text-amber-700 text-xs mb-1">
                  Selling Price
                </label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  name="sellingPrice"
                  type="number"
                  value={qty.sellingPrice}
                  onChange={(e) => handleQuantityChange(index, e)}
                  required
                />
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <label className="block text-amber-700 text-xs mb-1">
                    MRP
                  </label>
                  <input
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    name="mrp"
                    type="number"
                    value={qty.mrp}
                    onChange={(e) => handleQuantityChange(index, e)}
                    required
                  />
                </div>
                {formData.quantities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuantityField(index)}
                    className="ml-2 text-red-500 hover:text-red-700 bg-red-50 rounded-full p-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderFormFields = () => {
    switch (formData.category) {
      case "ready-mix-concrete":
      case "cement":
      case "steel":
      case "tools":
      case "electrical":
      case "plumbing":
      case "furniture":
        return (
          <>
            <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-sm font-bold text-amber-800 mb-2">Product Naming Guidelines</h3>
              <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
                <li>Use letters, numbers, spaces, and hyphens only</li>
                <li>Keep names descriptive but concise (e.g., "Premium Cement")</li>
                <li>Include key attributes like size or type when relevant</li>
                <li>Avoid special characters: . $ # [ ] /</li>
              </ul>
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="productName"
              >
                Product Name
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="productName"
                name="productName"
                type="text"
                value={formData.productName}
                onChange={handleInputChange}
                required
                placeholder="e.g., Premium Cement"
              />
              <p className="text-xs text-amber-600 mt-1">
                Avoid using these characters: . $ # [ ] /
              </p>
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="brand"
              >
                Brand
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                required
              />
            </div>
            {renderQuantityFields()}
          </>
        );
      case "bricks":
        return (
          <>
            <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-sm font-bold text-amber-800 mb-2">Product Naming Guidelines</h3>
              <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
                <li>Use letters, numbers, spaces, and hyphens only</li>
                <li>Keep names descriptive but concise (e.g., "Premium Cement 50kg")</li>
                <li>Include key attributes like size or type when relevant</li>
                <li>Avoid special characters: . $ # [ ] /</li>
              </ul>
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="productName"
              >
                Product Name
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="productName"
                name="productName"
                type="text"
                value={formData.productName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="brickType"
              >
                Type of Brick
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="brickType"
                name="brickType"
                type="text"
                value={formData.brickType}
                onChange={handleInputChange}
                required
              />
            </div>
            {renderQuantityFields()}
          </>
        );
      case "tiles":
        return (
          <>
            <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-sm font-bold text-amber-800 mb-2">Product Naming Guidelines</h3>
              <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
                <li>Use letters, numbers, spaces, and hyphens only</li>
                <li>Keep names descriptive but concise (e.g., "Premium Cement 50kg")</li>
                <li>Include key attributes like size or type when relevant</li>
                <li>Avoid special characters: . $ # [ ] /</li>
              </ul>
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="productName"
              >
                Product Name
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="productName"
                name="productName"
                type="text"
                value={formData.productName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="brand"
              >
                Brand
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                required
              />
            </div>
            {renderTileSizeFields()}
          </>
        );
      case "paint":
        return (
          <>
            <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-sm font-bold text-amber-800 mb-2">Product Naming Guidelines</h3>
              <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
                <li>Use letters, numbers, spaces, and hyphens only</li>
                <li>Keep names descriptive but concise (e.g., "Premium Cement 50kg")</li>
                <li>Include key attributes like size or type when relevant</li>
                <li>Avoid special characters: . $ # [ ] /</li>
              </ul>
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="productName"
              >
                Product Name
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="productName"
                name="productName"
                type="text"
                value={formData.productName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-amber-800 text-sm font-bold mb-2"
                htmlFor="brand"
              >
                Brand
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                required
              />
            </div>
            {renderPaintQuantityFields()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-amber-100">Products</span>
            <span className="mx-2 text-white">/</span>
            <span className="text-white">{isEditMode ? 'Edit Product' : 'Add Product'}</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
            <h2 className="text-xl font-bold text-amber-800 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6H8a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 010-2h1v-1a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  className="block text-amber-800 text-sm font-bold mb-2"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  required
                  disabled={isEditMode}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category && renderFormFields()}

              {formData.category && (
                <>
                  <div className="mb-6">
                    <label
                      className="block text-amber-800 text-sm font-bold mb-2"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 h-32"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-8">
                    <label className="block text-amber-800 text-sm font-bold mb-2">
                      Product Images
                    </label>

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
                        dragActive
                          ? "border-amber-400 bg-amber-50"
                          : "border-amber-200 bg-amber-50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        id="product-images"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="product-images"
                        className={`cursor-pointer flex flex-col items-center justify-center ${
                          uploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <svg
                          className="w-12 h-12 text-amber-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-amber-700 font-medium">
                          Drag & drop images here, or click to select files
                        </p>
                        <p className="text-amber-500 text-sm mt-1">
                          Maximum file size: 5MB. Accepted formats: JPEG, PNG,
                          GIF
                        </p>
                      </label>
                    </div>

                    {(imagePreviews.length > 0 || existingImages.length > 0) && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-amber-700 mb-3">
                          Selected Images ({imagePreviews.length + existingImages.length}):
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index}`}
                                className="h-24 w-24 object-cover rounded-lg border-2 border-amber-200 shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100 shadow-md"
                                title="Remove image"
                                disabled={uploading}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shadow-md transition-all duration-200 ${
                        uploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={uploading}
                    >
                      {uploading 
                        ? isEditMode 
                          ? "Updating Product..." 
                          : "Adding Product..."
                        : isEditMode
                          ? "Update Product"
                          : "Add Product"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;