/** Reusable single-select question blocks for laptop quiz. */

function OptionGrid({ options, value, onChange, columns = 2 }) {
  return (
    <div className={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : ''} gap-3`}>
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`py-4 px-4 rounded-2xl border-2 font-bold text-sm text-left transition-all
            ${value === opt.key
              ? 'border-primary bg-primary-light text-primary'
              : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function QuestionBlock({ title, hint, children }) {
  return (
    <div className="space-y-3 pt-6 border-t border-gray-100 first:border-t-0 first:pt-0">
      <div>
        <h4 className="text-base font-extrabold text-gray-900">{title}</h4>
        {hint && (
          <p className="text-xs font-extrabold text-gray-600 uppercase tracking-widest mt-1">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function LaptopScreenCashifyStep({
  screenScratch,
  setScreenScratch,
  screenDiscolouration,
  setScreenDiscolouration,
  screenSpots,
  setScreenSpots,
  screenLines,
  setScreenLines,
  isScreenOriginal,
  setIsScreenOriginal,
  options,
}) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-extrabold text-gray-900">5. Screen condition</h3>
        <p className="text-xs font-extrabold text-gray-600 uppercase tracking-widest mt-1">
          Choose one option per row (nothing is pre-selected)
        </p>
      </div>
      <QuestionBlock title="Scratch or broken on screen" hint="Select screen scratch or broken condition">
        <OptionGrid options={options.SCREEN_SCRATCH_OPTIONS} value={screenScratch} onChange={setScreenScratch} />
      </QuestionBlock>
      <QuestionBlock title="Discolouration on screen" hint="Select discolouration condition">
        <OptionGrid options={options.SCREEN_DISCOLOUR_OPTIONS} value={screenDiscolouration} onChange={setScreenDiscolouration} />
      </QuestionBlock>
      <QuestionBlock title="Spots on screen" hint="Select spot condition">
        <OptionGrid options={options.SCREEN_SPOTS_OPTIONS} value={screenSpots} onChange={setScreenSpots} />
      </QuestionBlock>
      <QuestionBlock title="Lines on screen" hint="Visible lines, flickering, or black dots">
        <OptionGrid options={options.SCREEN_LINES_OPTIONS} value={screenLines} onChange={setScreenLines} />
      </QuestionBlock>
      <QuestionBlock title="Is the screen original?" hint="Copy / replaced screen">
        <OptionGrid options={options.SCREEN_ORIGINAL_OPTIONS} value={isScreenOriginal} onChange={setIsScreenOriginal} />
      </QuestionBlock>
    </div>
  );
}

export function LaptopBodyCashifyStep({
  bodyScratch,
  setBodyScratch,
  dentTop,
  setDentTop,
  dentBase,
  setDentBase,
  looseHinges,
  setLooseHinges,
  panelCondition,
  setPanelCondition,
  options,
}) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-extrabold text-gray-900">6. Physical condition</h3>
        <p className="text-xs font-extrabold text-gray-600 uppercase tracking-widest mt-1">
          Scratches, dents, hinges, and panel — choose one option per row
        </p>
      </div>
      <QuestionBlock title="Scratch on body" hint="Select body scratch condition">
        <OptionGrid options={options.BODY_SCRATCH_OPTIONS} value={bodyScratch} onChange={setBodyScratch} />
      </QuestionBlock>
      <QuestionBlock title="Dent on top panel" hint="Select top panel dent condition">
        <OptionGrid options={options.DENT_TOP_OPTIONS} value={dentTop} onChange={setDentTop} />
      </QuestionBlock>
      <QuestionBlock title="Dent on base panel" hint="Select base panel dent condition">
        <OptionGrid options={options.DENT_BASE_OPTIONS} value={dentBase} onChange={setDentBase} />
      </QuestionBlock>
      <QuestionBlock title="Loose hinges" hint="Select hinge condition">
        <OptionGrid options={options.LOOSE_HINGES_OPTIONS} value={looseHinges} onChange={setLooseHinges} />
      </QuestionBlock>
      <QuestionBlock title="Cracked or loose panel" hint="Select panel condition">
        <OptionGrid options={options.PANEL_OPTIONS} value={panelCondition} onChange={setPanelCondition} />
      </QuestionBlock>
    </div>
  );
}

export function LaptopSoftwareStep({ softwareIssue, setSoftwareIssue, options }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-extrabold text-gray-900">8. Software issue</h3>
        <p className="text-xs font-extrabold text-gray-600 uppercase tracking-widest mt-1">
          Overall condition — choose what applies
        </p>
      </div>
      <OptionGrid options={options.SOFTWARE_OPTIONS} value={softwareIssue} onChange={setSoftwareIssue} />
    </div>
  );
}
