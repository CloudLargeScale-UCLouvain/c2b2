Tps_Open=50
Tps_Query=50
Tps_Transfer=20

python generateArtiTest.py

#chmod +x generate.sh
#./generate.sh

#python modifyTPS.py $Tps_Open $Tps_Query $Tps_Transfer


python ModifAddTabTOConfigFile.py

cp values.yaml ../caliper/values.yaml