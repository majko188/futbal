
            document.getElementById('poll-form').addEventListener('submit', async (event) => {
                event.preventDefault();
                const response = document.querySelector('input[name="response"]:checked').value;
                const token = localStorage.getItem('token');

                const result = await fetch('/submit-poll-response', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ response })
                });

                if (result.ok) {
                    alert('Response submitted successfully!');
                } else {
                    alert('Failed to submit response.');
                }
            });

            async function loadPollStatus() {
                const result = await fetch('/poll-status', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await result.json();
                document.getElementById('poll-status').innerText = JSON.stringify(data);
            }

            async function loadFinancialStatus() {
                const result = await fetch('/financial-status', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await result.json();
                document.getElementById('financial-status').innerText = `Dlh: ${data.debt}, Platby: ${data.payments}, Zostatok: ${data.balance}`;
            }

            loadPollStatus();
            loadFinancialStatus();
        