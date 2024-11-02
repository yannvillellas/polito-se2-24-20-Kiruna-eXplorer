import React from 'react';
import AssociationAPI from '../../api/associationAPI';

const LinkCreationButton = ({ selectedDocs, selectedLinkType, onLinkCreated }) => {
  const createLink = async () => {
    if (selectedDocs.length !== 2) {
      alert('Please select exactly two documents to link.');
      return;
    }

    try {
      await AssociationAPI.createAssociation({
        doc1: selectedDocs[0],
        doc2: selectedDocs[1],
        type: selectedLinkType
      });
      onLinkCreated();
    } catch (error) {
      console.error('Failed to create link:', error);
    }
  };

  return (
    <div>
      <button onClick={createLink}>Create Link</button>
    </div>
  );
};

export default LinkCreationButton;
