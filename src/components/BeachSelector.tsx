
import { Beach } from '@/types/weather';
import { Button } from '@/components/ui/button';

interface BeachSelectorProps {
  beaches: Beach[];
  selectedBeach: Beach;
  onBeachChange: (beach: Beach) => void;
}

export const BeachSelector = ({ beaches, selectedBeach, onBeachChange }: BeachSelectorProps) => {
  return (
    <div className="space-y-3">
      {beaches.map((beach, index) => (
        <Button
          key={index}
          variant={selectedBeach.name === beach.name ? "default" : "outline"}
          className={`w-full text-left justify-start py-4 px-6 text-base font-normal rounded-none transition-all duration-200 ${
            selectedBeach.name === beach.name 
              ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md" 
              : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          }`}
          onClick={() => onBeachChange(beach)}
        >
          {beach.name}
        </Button>
      ))}
    </div>
  );
};
