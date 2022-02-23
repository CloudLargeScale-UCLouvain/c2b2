echo "new caliper run"

helm delete caliper --namespace=carrier-net
helm delete caliper --namespace=manufacturer-net
helm delete caliper --namespace=buyer-net

sleep 15

cd ourAutomation
./generateCaliperConfig.sh 

cd ..
helm install caliper caliper/ --set organization=carrier --namespace=carrier-net
helm install caliper caliper/ --set organization=manufacturer --namespace=manufacturer-net
helm install caliper caliper/ --set organization=buyer --namespace=buyer-net