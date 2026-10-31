import { colorForChar } from '../data/characters';

interface Props {
  rows: string[];
  onPress: (char: string) => void;
}

/** Optional touch keyboard laid out like a real one. Buttons never take focus. */
export function OnScreenKeyboard({ rows, onPress }: Props) {
  return (
    <div className="osk" role="group" aria-label="On-screen keyboard">
      {rows.map((row) => (
        <div className="osk-row" key={row}>
          {row.split('').map((char) => (
            <button
              key={char}
              type="button"
              className="osk-key"
              style={{ color: colorForChar(char) }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPress(char)}
            >
              {char}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
