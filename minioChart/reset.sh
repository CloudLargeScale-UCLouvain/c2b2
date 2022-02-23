set -v
helm delete myminio
sleep 10
kubectl delete -f minio-pvc.yaml 
sleep 5
kubectl apply -f minio-pvc.yaml 
sleep 10
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install myminio -f values.yaml bitnami/minio --version=7.1.2