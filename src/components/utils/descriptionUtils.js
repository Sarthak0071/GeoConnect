// descriptionUtils.js
export const fetchDescription = async (place) => {
    console.log(`Fetching description for: ${place.name}`);
    
    try {
      const response = await fetch(`http://localhost:5000/api/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeName: place.name,
          city: place.locationName || place.city || ""
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate description');
      }
  
      const data = await response.json();
      console.log(`Received description for: ${place.name}`);
      
      return data.description;
    } catch (error) {
      console.error(`Error generating description for ${place.name}:`, error);
      throw error;
    }
  };