"use client";

import { useCallback, useEffect, useState } from "react";
import { FeatureFlag } from "@/features/flags";
import { useSchematicEntitlement } from "@schematichq/schematic-react";
import Usage from "./Usage";
import { getYoutubeTranscript } from "@/actions/getYoutubeTranscript";


interface TranscriptEntry {
  text: string;
  timestamp: string;
}

function Transcription({ videoId }: { videoId: string }) {
  const [transcript, setTranscript] = useState<{
    transcript: TranscriptEntry[];
    cache: string;
  } | null>(null);

  const { value: featureUsageExceeded } = useSchematicEntitlement(
    FeatureFlag.TRANSCRIPTION
  );



  const handleGenerateTranscription = useCallback(async (videoId: string) => {
    if (featureUsageExceeded) {
      console.log("Transcription limit reached, the user must upgrade");
      return;
    }
  
    const result = await getYoutubeTranscript(videoId);
    setTranscript(result);
  }, [featureUsageExceeded]);
  

  useEffect(() => {
    handleGenerateTranscription(videoId);
  }, [handleGenerateTranscription, videoId]);
  




  return (
    <div className="border p-4 pb-0 rounded-xl gap-4 flex flex-col bg-black">
      <Usage featureFlag={FeatureFlag.TRANSCRIPTION} title="Transcription" />

      {/* Transcription */}
      {featureUsageExceeded ? (
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto rounded-md p-4">
          {transcript ? (
            transcript.transcript.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-gray-400 min-w-[50px]">
                  {entry.timestamp}
                </span>
                <p className="text-sm text-gray-200">{entry.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No transcription available</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Transcription;
