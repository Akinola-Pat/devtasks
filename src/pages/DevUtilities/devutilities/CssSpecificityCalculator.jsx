import React, { useState } from "react";

const CssSpecificityCalculator = () => {
  const [selector, setSelector] = useState("");
  const [specificity, setSpecificity] = useState(null);
  const calculateSpecificity = () => {
    if (!selector.trim()) {
      setSpecificity(null);
      return;
    }

    const idCount = (selector.match(/#[a-zA-Z0-9_-]+/g) || []).length;

    const classCount = (
      selector.match(/\.[a-zA-Z0-9_-]+/g) || []
    ).length;

    const attributeCount = (
      selector.match(/\[[^\]]+\]/g) || []
    ).length;

    const pseudoClassCount = (
      selector.match(/:(?!:)[a-zA-Z-]+(?:\([^)]*\))?/g) || []
    ).length;

    const elementCount = (
      selector.match(
        /(^|[\s>+~])([a-zA-Z][a-zA-Z0-9_-]*|\*)/g
      ) || []
    ).length;

    const pseudoElementCount = (
      selector.match(/::[a-zA-Z-]+/g) || []
    ).length;

    const specificityValue = [
      idCount,
      classCount + attributeCount + pseudoClassCount,
      elementCount + pseudoElementCount,
    ];

    setSpecificity({
      ids: idCount,
      classes: classCount,
      attributes: attributeCount,
      pseudoClasses: pseudoClassCount,
      elements: elementCount,
      pseudoElements: pseudoElementCount,
      value: specificityValue,
    });
  };
  return (
    <div>
      <h1>CSS Specificity Calculator</h1>

      <p>
        Enter a CSS selector to calculate its specificity.
      </p>

      <textarea
        value={selector}
        onChange={(e) => setSelector(e.target.value)}
        placeholder="e.g. #header .nav li.active"
      />
            <button onClick={calculateSpecificity}>
        Calculate Specificity
      </button>

      {specificity && (
        <div>
          <h2>Specificity</h2>

          <p>
            <strong>({specificity.value.join(", ")})</strong>
          </p>

          <ul>
            <li>IDs: {specificity.ids}</li>
            <li>Classes: {specificity.classes}</li>
            <li>Attributes: {specificity.attributes}</li>
            <li>Pseudo-classes: {specificity.pseudoClasses}</li>
            <li>Elements: {specificity.elements}</li>
            <li>Pseudo-elements: {specificity.pseudoElements}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CssSpecificityCalculator;