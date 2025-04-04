document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.querySelector('.form-container');
    const congratsContainer = document.querySelector('.congrats-container');
    const loginForm = document.querySelector('.login-form');
    const signupForm = document.querySelector('.signup-form');
    const switchFormLink = document.querySelector('.switch-form');
    const continueBtn = document.getElementById('continue-btn');
    let isLogin = true;

    // Mouse move effect for 3D rotation
    formContainer.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = formContainer.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;
        
        const rotateX = (y - 0.5) * 10;
        const rotateY = (x - 0.5) * 10;
        
        formContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Reset rotation when mouse leaves
    formContainer.addEventListener('mouseleave', () => {
        formContainer.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });

    // Form switch handler
    switchFormLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        
        const formHeader = document.querySelector('.form-header');
        const formTitle = formHeader.querySelector('h2');
        const formSubtitle = formHeader.querySelector('p');
        
        if (isLogin) {
            formTitle.textContent = 'Welcome Back';
            formSubtitle.textContent = 'Please login to your account';
            switchFormLink.textContent = 'Sign Up';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            formTitle.textContent = 'Create Account';
            formSubtitle.textContent = 'Please sign up to continue';
            switchFormLink.textContent = 'Login';
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        }
        
        // Add animation class
        formContainer.classList.add('form-switch');
        setTimeout(() => {
            formContainer.classList.remove('form-switch');
        }, 500);
    });

    // Password strength indicator
    const passwordInput = signupForm.querySelector('input[name="password"]');
    const confirmPasswordInput = signupForm.querySelector('input[name="confirmPassword"]');
    
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });

    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
        return strength;
    }

    function updatePasswordStrengthIndicator(strength) {
        const strengthBar = document.querySelector('.password-strength-bar');
        if (!strengthBar) return;
        
        const width = (strength / 5) * 100;
        strengthBar.style.width = `${width}%`;
        
        // Update color based on strength
        if (strength <= 2) {
            strengthBar.style.background = '#ff6b6b';
        } else if (strength <= 4) {
            strengthBar.style.background = '#ffd166';
        } else {
            strengthBar.style.background = '#06d6a0';
        }
    }

    // Profile photo handling
    const profilePhotoInput = document.getElementById('profile-photo');
    const photoPreview = document.getElementById('photo-preview');
    const photoPreviewContainer = document.querySelector('.photo-preview');

    photoPreviewContainer.addEventListener('click', () => {
        profilePhotoInput.click();
    });

    profilePhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Update signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('signup-username').value,
            email: document.getElementById('signup-email').value,
            password: document.getElementById('signup-password').value,
            profilePhoto: photoPreview.src
        };

        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify(formData));
        
        // Show success message and redirect
        showSuccessMessage();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);
        
        // Here you would typically verify credentials with your backend
        // For demo purposes, we'll just redirect to the music player
        window.location.href = 'music-player.html';
    });

    // Continue button handler
    continueBtn.addEventListener('click', () => {
        hideCongratsPage();
        isLogin = true;
        switchFormLink.click();
    });

    function showCongratsPage() {
        formContainer.style.opacity = '0';
        formContainer.style.visibility = 'hidden';
        congratsContainer.classList.add('show');
    }

    function hideCongratsPage() {
        congratsContainer.classList.remove('show');
        formContainer.style.opacity = '1';
        formContainer.style.visibility = 'visible';
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        signupForm.appendChild(errorDiv);
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    function showSuccessMessage() {
        // Implementation of showing a success message
        console.log('User data stored successfully');
        showCongratsPage();
    }
}); 