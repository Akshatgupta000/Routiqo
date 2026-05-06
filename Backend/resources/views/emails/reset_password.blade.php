<!DOCTYPE html>
<html>
<head>
    <style>
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #7CFC00;
            letter-spacing: 5px;
            background: #f4f4f4;
            padding: 20px;
            border-radius: 10px;
            display: inline-block;
            margin: 20px 0;
            border: 1px solid #ddd;
        }
        body {
            font-family: 'Inter', sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            padding: 20px;
            max-width: 600px;
            margin: auto;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>You are receiving this email because we received a password reset request for your account. Use the code below to verify your identity. This code will expire in 15 minutes.</p>
        
        <div class="otp-code">
            {{ $otp }}
        </div>

        <p>If you did not request a password reset, no further action is required.</p>
        <p>Regards,<br>Team Routiqo</p>
    </div>
</body>
</html>
