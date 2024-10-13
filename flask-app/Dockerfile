# Use the official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /usr/src/app

# Copy the Flask app code to the container
COPY . .

# Install Flask and pymongo
RUN pip install Flask pymongo

# Expose port 5000 for the Flask server
EXPOSE 5000

# Start the Flask application
CMD ["python", "app.py"]
