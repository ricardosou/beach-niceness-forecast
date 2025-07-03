
import { Beach } from '@/types/weather';
import { Button } from '@/components/ui/button';

interface BeachSelectorProps {
  beaches: Beach[];
  selectedBeach: Beach;
  onBeachChange: (beach: Beach) => void;
}

export const BeachSelector = ({ beaches, selectedBeach, onBeachChange }: BeachSelectorProps) => {
  return (
    <div className="space-y-2">
      {beaches.map((beach, index) => (
        <Button
          key={index}
          variant={selectedBeach.name === beach.name ? "default" : "outline"}
          className="w-full text-left justify-start"
          onClick={() => onBeachChange(beach)}
        >
          {beach.name}
        </Button>
      ))}
    </div>
  );
};
