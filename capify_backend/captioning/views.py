from django.contrib import messages, auth
from django.contrib.auth import authenticate
from django.shortcuts import render, redirect
from rest_framework import status
from rest_framework.decorators import api_view
from django.conf import settings
import os
import pickle

from rest_framework.response import Response
from rest_framework.views import APIView
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import custom_object_scope
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras import Model

from captioning.forms import CreateUserForm, LoginForm
from captioning.serializers import RegisterSerializer, LoginSerializer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'captioning', 'model')
vgg16 = VGG16(weights='imagenet')
vgg_model = Model(inputs=vgg16.input, outputs=vgg16.layers[-2].output)

with custom_object_scope({'LSTM': lambda **kwargs: tf.keras.layers.LSTM(**{k: v for k, v in kwargs.items() if k != 'time_major'})}):
    model = load_model(os.path.join(MODEL_DIR, 'vgg16_model.h5'))

with open(os.path.join(MODEL_DIR, 'tokenizer.pkl'), 'rb') as handle:
    tokenizer = pickle.load(handle)


def extract_features(img_path):

    img = image.load_img(img_path, target_size=(224, 224))
    img = image.img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = preprocess_input(img)

    feature = vgg_model.predict(img,verbose=0)
    return feature


def predict_caption(photo_feature):
    in_text = 'startseq'
    max_length = 35
    for _ in range(max_length):
        seq = tokenizer.texts_to_sequences([in_text])[0]
        seq = np.pad(seq, (0, max_length - len(seq)), 'constant')
        seq = np.expand_dims(seq, axis=0)

        yhat = model.predict([photo_feature, seq], verbose=0)
        yhat = np.argmax(yhat)

        word = None
        for w, index in tokenizer.word_index.items():
            if index == yhat:
                word = w
                break

        if word is None or word == 'endseq':
            break
        in_text += ' ' + word

    return in_text.replace('startseq', '').strip()

@api_view(['POST', 'GET'])
def generate_caption(request):
    if request.method == 'GET':
        return Response({'message': 'Send a POST request with an image.'}, status=status.HTTP_200_OK)

    if 'free_trail' not in request.session:
        request.session['free_trail'] = 0

    if request.session['free_trail'] >= 2:
        return Response({'error': 'Free trial limit reached. Please login.'}, status=status.HTTP_403_FORBIDDEN)

    if 'image' not in request.FILES:
        return Response({'error': 'No image uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

    img_file = request.FILES['image']
    img_path = os.path.join(settings.MEDIA_ROOT, img_file.name)

    with open(img_path, 'wb+') as f:
        for chunk in img_file.chunks():
            f.write(chunk)

    features = extract_features(img_path)
    caption = predict_caption(features)
    request.session['free_trail'] += 1

    return Response({'caption': caption}, status=status.HTTP_200_OK)





class RegisterAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message":"Successfully Registered"},status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username=serializer.validated_data['username']
            password=serializer.validated_data['password']
            user = authenticate(request, username = username, password=password)
            if user is not None:
                return Response({"message":"Login Successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"error":"Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def register(request):
    form = CreateUserForm()
    if request.method=='POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registered Successfully')
            return redirect('login')
    context = {'form':form}
    return render(request,'register.html', context=context)

def my_login(request):
    form = LoginForm()
    if request.method=='POST':
        form=LoginForm(request, data=request.POST)
        if form.is_valid():
            username = request.POST.get('username')
            password = request.POST.get('password')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                auth.login(request, user)
                return redirect('dashboard')
    context = {'form':form}
    return render(request,'my-login.html', context=context)