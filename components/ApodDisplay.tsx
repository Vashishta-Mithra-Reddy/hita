'use client';
import { useEffect, useState } from 'react';

interface ApodData { 
  date: string;
  explanation: string;
  hdurl: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
}

export function ApodDisplay() {
  const [apod, setApod] = useState<ApodData>({} as ApodData);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        const response = await fetch(
          'https://api.nasa.gov/planetary/apod?api_key=faJ53ZmU6WlcukvvcpNXQHNesPJo4mkzaAhh4fei'
        );
        const data = await response.json();
        setApod(data as ApodData);
      } catch (err) {
        setError('Failed to load APOD, Error details: '+err);
      } finally {
        setLoading(false);
      }
    };

    fetchAPOD();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!apod) return <div>No APOD available</div>;

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col items-center justify-center py-2">
      {/* <h2 className="text-2xl font-bold mb-4 font-satoshi">Look into space for a while</h2> */}
      {apod.media_type === 'image' ? (
        <img 
          src={apod.url} 
          alt={apod.title} 
          className="w-full h-auto rounded-lg bg-gradient-to-b from-transparent to-background"

        />
      ) : (
        <div className="aspect-video">
          <iframe 
            src={apod.url} 
            className="w-full h-full rounded-lg bg-gradient-to-b from-transparent to-background"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}