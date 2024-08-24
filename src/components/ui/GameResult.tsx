import React, {useEffect} from "react";
import Header from "./Header";
import ConfettiGenerator from "../animation/confetti";



const GameResult = ({
  start,
  clock,
  moves,
  handleNewGame,
}: {
  start: boolean;
  clock?: number;
  moves?: number;
  handleNewGame: () => void;
}) => {

  React.useEffect(() => {
    const confettiSettings = { target: 'my-canvas', max: 300, clock: 45, colors: [[165,104,246],[230,61,135],[0,199,228],[253,214,126]], rotate: true };
    const confetti= new (ConfettiGenerator as any)(confettiSettings);
    confetti.render();
  
    return () => confetti.clear();
  }, []);
  return (
    <div className="flex">
      <canvas className="absolute inset-0 z-0"  id="my-canvas">
       </canvas>
        <div
          className={`h-[100vh] overflow-hidden z-10 w-full`}
        >
          <Header clock={clock} start={start} moves={moves} />
          <div className="flex flex-col items-center justify-center w-full h-full text-xl transition-opacity duration-700">
            <p>Parabéns, você conseguiu!</p>
            {clock != undefined && (
              <div>
                <p className="text-center">
                  {clock > 60
                    ? `Levou ${Math.floor(clock / 60)}m:${Math.floor(
                        clock % 60
                      )}s e${" "}
                  ${moves} movimentos.`
                    : `Levou ${clock}s e ${moves} movimentos.`}
                </p>
                <p className="text-center">Consegue fazer melhor?</p>
              </div>
            )}
            <button
              className="p-2 mt-2 font-medium text-white bg-green-400 border border-green-800 rounded-full shadow-lg hover:border-white shadow-slate-600 hover:shadow"
              onClick={handleNewGame}
            >
              Jogar novamente
            </button>
          </div>
        </div>
    </div>
    
  );
};

export default GameResult;
