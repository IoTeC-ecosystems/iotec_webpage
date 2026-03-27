'use strict';

$(function () {

  /* =========================================
     1. NAVBAR — scroll + hamburger + overlay
     ========================================= */
  const $navbar   = $('#navbar');
  const $hamburger = $('#hamburger');
  const $navLinks  = $('#navLinks');
  const $overlay   = $('#navOverlay');

  function openMenu() {
    $navLinks.addClass('open');
    $overlay.addClass('active');
    $hamburger
      .html('<i class="fa-solid fa-xmark"></i>')
      .attr('aria-expanded', 'true');
    $('body').addClass('no-scroll');
  }

  function closeMenu() {
    $navLinks.removeClass('open');
    $overlay.removeClass('active');
    $hamburger
      .html('<i class="fa-solid fa-bars"></i>')
      .attr('aria-expanded', 'false');
    $('body').removeClass('no-scroll');
  }

  $(window).on('scroll.navbar', function () {
    if ($(this).scrollTop() > 50) {
      $navbar.addClass('navbar--scrolled');
    } else {
      $navbar.removeClass('navbar--scrolled');
    }
  });

  $hamburger.on('click', function () {
    $navLinks.hasClass('open') ? closeMenu() : openMenu();
  });

  // Cerrar menú al hacer clic en overlay
  $overlay.on('click', closeMenu);

  // Cerrar menú con tecla ESC
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape' && $navLinks.hasClass('open')) closeMenu();
  });

  // Cerrar menú al hacer clic en un enlace
  $navLinks.find('a').on('click', closeMenu);

  /* =========================================
     2. ACTIVE LINK — resaltado según sección visible
     ========================================= */
  const sections = $('section[id]').toArray();

  $(window).on('scroll.activeLink', function () {
    const scrollY = $(this).scrollTop() + $navbar.outerHeight() + 40;

    sections.forEach(function (sec) {
      const $sec = $(sec);
      const top    = $sec.offset().top;
      const bottom = top + $sec.outerHeight();

      if (scrollY >= top && scrollY < bottom) {
        $navLinks.find('a').removeClass('active');
        $navLinks.find('a[href="#' + $sec.attr('id') + '"]').addClass('active');
      }
    });
  });

  /* =========================================
     3. SMOOTH SCROLL para links internos
     ========================================= */
  $('a[href^="#"]').on('click', function (e) {
    const target = $(this).attr('href');
    if (target === '#' || !$(target).length) return;
    e.preventDefault();
    const offset = $(target).offset().top - $navbar.outerHeight();
    $('html, body').animate({ scrollTop: offset }, 500, 'swing');
  });

  /* =========================================
     4. ANIMACIONES ON-SCROLL (data-aos con stagger)
     ========================================= */
  // Apply data-delay as inline transition-delay only once per element
  $('[data-aos][data-delay]').each(function () {
    const delay = parseInt($(this).data('delay'), 10);
    if (!isNaN(delay) && delay > 0) {
      $(this).css('transition-delay', delay + 'ms');
    }
  });

  function checkAos() {
    $('[data-aos]:not(.aos-animate)').each(function () {
      const elementTop = $(this).offset().top;
      const viewBottom = $(window).scrollTop() + $(window).height();
      if (viewBottom > elementTop + 60) {
        $(this).addClass('aos-animate');
      }
    });
  }

  $(window).on('scroll.aos resize.aos', checkAos);
  checkAos(); // Comprobar al cargar

  /* =========================================
     6. SCROLL TO TOP
     ========================================= */
  const $scrollTop = $('#scrollTop');

  $(window).on('scroll.scrollTop', function () {
    if ($(this).scrollTop() > 400) {
      $scrollTop.addClass('visible');
    } else {
      $scrollTop.removeClass('visible');
    }
  });

  $scrollTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 500, 'swing');
  });

  /* =========================================
     7. AÑO ACTUAL en el footer
     ========================================= */
  $('#year').text(new Date().getFullYear());

  /* =========================================
     8. FORMULARIO DE CONTACTO (validación + AJAX)
     ========================================= */
  const $form      = $('#contactForm');
  const $submitBtn = $('#submitBtn');
  const $alert     = $('#formAlert');

  function showFieldError(fieldId, msg) {
    $('#' + fieldId).addClass('input--error');
    $('#error-' + fieldId).text(msg);
  }

  function clearFieldError(fieldId) {
    $('#' + fieldId).removeClass('input--error');
    $('#error-' + fieldId).text('');
  }

  // Limpiar errores en tiempo real
  $form.find('input, textarea').on('input', function () {
    clearFieldError($(this).attr('id'));
  });

  function validateForm() {
    let valid = true;
    const nombre  = $('#nombre').val().trim();
    const email   = $('#email').val().trim();
    const mensaje = $('#mensaje').val().trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nombre) {
      showFieldError('nombre', 'El nombre es obligatorio.');
      valid = false;
    } else {
      clearFieldError('nombre');
    }

    if (!email) {
      showFieldError('email', 'El correo es obligatorio.');
      valid = false;
    } else if (!emailRe.test(email)) {
      showFieldError('email', 'Ingresa un correo válido.');
      valid = false;
    } else {
      clearFieldError('email');
    }

    if (!mensaje) {
      showFieldError('mensaje', 'El mensaje es obligatorio.');
      valid = false;
    } else if (mensaje.length < 10) {
      showFieldError('mensaje', 'El mensaje debe tener al menos 10 caracteres.');
      valid = false;
    } else {
      clearFieldError('mensaje');
    }

    return valid;
  }

  $form.on('submit', function (e) {
    e.preventDefault();
    $alert.hide();

    if (!validateForm()) return;

    // Estado de carga
    $submitBtn.prop('disabled', true);
    $submitBtn.find('.btn-text').hide();
    $submitBtn.find('.btn-spinner').show();

    const payload = {
      nombre:  $('#nombre').val().trim(),
      email:   $('#email').val().trim(),
      asunto:  $('#asunto').val(),
      mensaje: $('#mensaje').val().trim()
    };

    $.ajax({
      url:         '/api/contacto',
      method:      'POST',
      contentType: 'application/json',
      data:        JSON.stringify(payload),
      dataType:    'json'
    })
    .done(function (res) {
      $alert
        .removeClass('form-alert--error')
        .addClass('form-alert form-alert--success')
        .text(res.mensaje)
        .fadeIn(300);
      $form[0].reset();
    })
    .fail(function (xhr) {
      const msg = (xhr.responseJSON && xhr.responseJSON.mensaje)
        ? xhr.responseJSON.mensaje
        : 'Ocurrió un error. Inténtalo de nuevo.';
      $alert
        .removeClass('form-alert--success')
        .addClass('form-alert form-alert--error')
        .text(msg)
        .fadeIn(300);
    })
    .always(function () {
      $submitBtn.prop('disabled', false);
      $submitBtn.find('.btn-text').show();
      $submitBtn.find('.btn-spinner').hide();
    });
  });

}); // end document.ready
