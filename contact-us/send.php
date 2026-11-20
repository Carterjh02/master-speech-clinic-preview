<?php

/**
 * MASTER SPEECH CLINIC
 * CONTACT FORM EMAIL HANDLER
 *
 * Requires PHP hosting with email delivery configured.
 */

declare(strict_types=1);


/* ==========================================
   RESPONSE HEADERS
========================================== */

header(
    'Content-Type: application/json; charset=utf-8'
);

header('Cache-Control: no-store');

header('X-Content-Type-Options: nosniff');


/* ==========================================
   RESPONSE HELPER
========================================== */

function respond(
    int $status,
    bool $ok,
    string $message
): void {

    http_response_code($status);

    echo json_encode([
        'ok' => $ok,
        'message' => $message
    ]);

    exit;

}


/* ==========================================
   REQUIRE POST
========================================== */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    header('Allow: POST');

    respond(
        405,
        false,
        'Method not allowed.'
    );

}


/* ==========================================
   REQUEST SIZE LIMIT
========================================== */

if (
    (int) ($_SERVER['CONTENT_LENGTH'] ?? 0)
    > 12000
) {

    respond(
        413,
        false,
        'Request is too large.'
    );

}


/* ==========================================
   BASIC ORIGIN VALIDATION
========================================== */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$host = $_SERVER['HTTP_HOST'] ?? '';

if ($origin !== '' && $host !== '') {

    $originHost = parse_url(
        $origin,
        PHP_URL_HOST
    );

    $requestHost = explode(
        ':',
        strtolower($host)
    )[0];

    if (
        !$originHost ||
        strtolower($originHost) !== $requestHost
    ) {

        respond(
            403,
            false,
            'Request not allowed.'
        );

    }

}


/* ==========================================
   SPAM HONEYPOT
========================================== */

if (!empty($_POST['website'])) {

    respond(
        200,
        true,
        'Thank you.'
    );

}


/* ==========================================
   CLEAN INPUT VALUES
========================================== */

function clean(
    string $field,
    int $max
): string {

    $value = trim(
        (string) ($_POST[$field] ?? '')
    );

    $value = preg_replace(
        '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/',
        '',
        $value
    );

    return substr(
        $value,
        0,
        $max
    );

}


/* ==========================================
   COLLECT FORM VALUES
========================================== */

$first = clean('first_name', 80);

$last = clean('last_name', 80);

$email = clean('email', 254);

$phone = clean('phone', 40);

$message = clean('message', 3000);


/* ==========================================
   VALIDATE REQUIRED FIELDS
========================================== */

if (
    $first === '' ||
    $last === '' ||
    $phone === '' ||
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {

    respond(
        422,
        false,
        'Please check the required fields.'
    );

}


/* ==========================================
   EMAIL CONFIGURATION
========================================== */

$to = 'info@masterspeechclinic.com';

$from = 'info@masterspeechclinic.com';

$subject =
    'Master Speech Clinic website inquiry';


/* ==========================================
   EMAIL BODY
========================================== */

$body =
    "A new inquiry was submitted through the website.\n\n" .

    "First Name: $first\n" .

    "Last Name: $last\n" .

    "Email: $email\n" .

    "Phone: $phone\n\n" .

    "Message:\n$message\n";


/* ==========================================
   EMAIL HEADERS
========================================== */

$headers = [

    'From' =>
        'Master Speech Clinic <' . $from . '>',

    'Reply-To' =>
        $email,

    'Content-Type' =>
        'text/plain; charset=UTF-8',

    'X-Mailer' =>
        'Master Speech Clinic website'

];


/* ==========================================
   CHECK EMAIL SUPPORT
========================================== */

if (!function_exists('mail')) {

    respond(
        503,
        false,
        'Email service is not configured.'
    );

}


/* ==========================================
   SEND EMAIL
========================================== */

$sent = @mail(
    $to,
    $subject,
    $body,
    $headers
);


/* ==========================================
   HANDLE FAILURE
========================================== */

if (!$sent) {

    error_log(
        'MSC website inquiry: PHP mail() failed.'
    );

    respond(
        503,
        false,
        'Email service is temporarily unavailable.'
    );

}


/* ==========================================
   SUCCESS
========================================== */

respond(
    200,
    true,
    'Thank you.'
);