import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Avatar({ url, size, onUpload }) {
  const [ImageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setImageUrl(url);
    } catch (error) {
      console.log("Error downloading image: ", error.message);
    }
  }
  async function uploadImage(event) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 text-center">
      {ImageUrl ? (
        <img
          src={ImageUrl}
          alt="Avatar"
          className="w-72 h-72 object-cover max-w-screen"
        />
      ) : (
        <div className="bg-gray-200 rounded-full w-full" />
      )}
      <div className="border-2 border-gray-800 rounded-lg p-2 hover:bg-gray-900 active:bg-gray-800 focus:bg-gray-900">
        <label className="button primary block" htmlFor="image">
          {uploading ? "Uploading ..." : "Choose image"}
        </label>
        <input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          id="image"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
