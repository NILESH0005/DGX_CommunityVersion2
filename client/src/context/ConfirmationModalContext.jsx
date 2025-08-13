    // ConfirmationModalContext.jsx
    import React, { createContext, useState } from 'react';
    import ConfirmationModal from '../component/ConfirmationModal'; // your modal component

    export const ConfirmationModalContext = createContext();

    export const ConfirmationModalProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProps, setModalProps] = useState({});

    const showConfirmModal = (title, message, onConfirm, onCancel) => {
        // console.log("Modal triggered:", title, message);
        setModalProps({
        title,
        message,
        onConfirm,
        onCancel,
        });
        setIsModalOpen(true);
    };

    const hideModal = () => setIsModalOpen(false);

    return (
        <ConfirmationModalContext.Provider value={{ showConfirmModal, hideModal }}>
        {children}
        {isModalOpen && (
            <ConfirmationModal
            title={modalProps.title}
            message={modalProps.message}
            onConfirm={() => {
                modalProps.onConfirm();
                hideModal();
            }}
            onCancel={() => {
                modalProps.onCancel();
                hideModal();
            }}
            />
        )}
        </ConfirmationModalContext.Provider>
    );
    };
