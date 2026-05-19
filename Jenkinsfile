pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            bat 'npm ci'
                        }
                    }
                }

                stage('Auth Dependencies') {
                    steps {
                        dir('auth-service') {
                            bat 'npm ci'
                        }
                    }
                }

                stage('Chat Dependencies') {
                    steps {
                        dir('chat-service') {
                            bat 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            bat 'npm run build'
                        }
                    }
                }

                stage('Maven Package') {
                    steps {
                        dir('maven-demo-service') {
                            bat 'mvn clean package'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Auth Tests') {
                    steps {
                        dir('auth-service') {
                            bat 'npm test'
                        }
                    }
                }

                stage('Chat Tests') {
                    steps {
                        dir('chat-service') {
                            bat 'npm test'
                        }
                    }
                }

                stage('Maven Tests') {
                    steps {
                        dir('maven-demo-service') {
                            bat 'mvn test'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker compose build'
                bat 'docker build -t pulse-maven-demo:ci maven-demo-service'
            }
        }

        stage('Deployment Simulation') {
            steps {
                bat 'docker compose config'
            }
        }
    }

    post {
        success {
            echo 'Pulse CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'Pulse CI/CD pipeline failed. Check the stage logs above.'
        }
    }
}
