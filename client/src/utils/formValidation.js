const errorClass = 'text-DGXgreen';
const validClass = 'text-red-500';

export const validateRequired = (field) => {
    const inputField = document.getElementById(field);
    const errorElement = document.getElementById(`${field}Verify`);
    if (inputField.value.trim() === '') {
        inputField.classList.remove('is-valid');
        inputField.classList.add('is-invalid');
        errorElement.classList.remove(errorClass);
        errorElement.classList.add(validClass);
        errorElement.textContent = 'This field is required. Please enter a value.';
    } else {
        inputField.classList.remove('is-invalid');
        inputField.classList.add('is-valid');
        errorElement.classList.remove(validClass);
        errorElement.classList.add(errorClass);
        errorElement.textContent = 'Valid input.';
    }
};

export const validatePhone = (phoneInput, phoneValue) => {
    const phoneVerify = document.getElementById('phoneNoVerify');
    if (!/^[6-9]\d{9}$/.test(phoneValue.trim())) {
        phoneInput.classList.remove('is-valid');
        phoneInput.classList.add('is-invalid');
        phoneVerify.classList.remove(errorClass);
        phoneVerify.classList.add(validClass);
        phoneVerify.textContent = 'Invalid phone number. Please enter a valid 10-digit number starting with 6-9.';
    } else {
        phoneInput.classList.remove('is-invalid');
        phoneInput.classList.add('is-valid');
        phoneVerify.classList.remove(validClass);
        phoneVerify.classList.add(errorClass);
        phoneVerify.textContent = 'Valid phone number.';
    }
};

export const validateEmail = (emailInput, emailValue) => {
    const emailVerify = document.getElementById('emailVerify');
    if (!/^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/.test(emailValue.trim())) {
        emailInput.classList.remove('is-valid');
        emailInput.classList.add('is-invalid');
        emailVerify.classList.remove(errorClass);
        emailVerify.classList.add(validClass);
        emailVerify.textContent = 'Invalid email address. Please enter a valid email in the format example@domain.com.';
    } else {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
        emailVerify.classList.remove(validClass);
        emailVerify.classList.add(errorClass);
        emailVerify.textContent = 'Valid email address.';
    }
};

export const validatePassword = (passwordInput, passwordValue) => {
    const passwordVerify = document.getElementById(passwordInput.id + 'Verify');
    // Clear any existing message - we'll only show the checklist
    passwordVerify.textContent = '';
    
    // Just update the input classes without showing a message
    if (passwordValue.length < 8 || !/\d/.test(passwordValue) || 
        !/[!@#$%^&*()_+={}\[\]:;<>,.?/~]/.test(passwordValue) || 
        !/[a-z]/.test(passwordValue) || !/[A-Z]/.test(passwordValue)) {
        passwordInput.classList.remove('is-valid');
        passwordInput.classList.add('is-invalid');
    } else {
        passwordInput.classList.remove('is-invalid');
        passwordInput.classList.add('is-valid');
    }
};

export const validateConfirmPassword = (passwordValue, confirmPasswordValue, confirmPasswordInput) => {
    if (!confirmPasswordInput) return;
    const conPasswordVerify = document.getElementById(confirmPasswordInput.id + 'Verify');
    if (!conPasswordVerify) return;

    if (confirmPasswordValue.trim() !== '') {
        if (confirmPasswordValue !== passwordValue) {
            confirmPasswordInput.classList.remove('is-valid');
            confirmPasswordInput.classList.add('is-invalid');
            conPasswordVerify.classList.remove(errorClass);
            conPasswordVerify.classList.add(validClass);
            conPasswordVerify.textContent = 'Passwords do not match. Please ensure both fields are identical.';
        } else {
            confirmPasswordInput.classList.remove('is-invalid');
            confirmPasswordInput.classList.add('is-valid');
            conPasswordVerify.classList.remove(validClass);
            conPasswordVerify.classList.add(errorClass);
            conPasswordVerify.textContent = 'Passwords match successfully.';
        }
    } else {
        confirmPasswordInput.classList.remove('is-valid');
        confirmPasswordInput.classList.add('is-invalid');
        conPasswordVerify.classList.remove(errorClass);
        conPasswordVerify.classList.add(validClass);
        conPasswordVerify.textContent = 'This field is required. Please enter the confirmation password.';
    }
};
