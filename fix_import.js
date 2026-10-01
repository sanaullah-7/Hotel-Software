const fs = require('fs');
const file = 'Client/src/features/reservations/pages/EditReservation.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { useNavigate, useParams, useEffect } from 'react-router-dom';", "import { useNavigate, useParams } from 'react-router-dom';\nimport { useEffect } from 'react';");

fs.writeFileSync(file, content, 'utf8');
