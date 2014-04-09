class Gamification < Sinatra::Application

  # Get all students
  #
  # return [Array] student objects
  get '/student' do
    if authorized?
      content_type :json
      @student = Student.all()

      @updatedStudents = []
      # fetch the latest fullname and avatar from facebook for each student
      @graph = Koala::Facebook::API.new(session["access_token"])
      @student.each do |student|
        unless student.facebookId == "0000" then
          user = @graph.get_object(student.facebookId)
          avatar = @graph.get_picture(student.facebookId)

          student['firstName'] = user["first_name"];
          student['lastName'] = user["last_name"];
          student['avatar'] = avatar;
        end
        @updatedStudents.push(student);
      end

      status 200
      return @updatedStudents.to_json

    else
      status 401
    end
  end

  # Get a student by id
  #
  # param [String] the student id
  #
  # return [Object] student
  get '/student/:id' do
    if authorized?
      content_type :json

      student = Student.find(params[:id])

      unless student.facebookId == "0000" then
        @graph = Koala::Facebook::API.new(session["access_token"])
        user = @graph.get_object(student.facebookId)
        avatar = @graph.get_picture(student.facebookId)

        student['firstName'] = user["first_name"];
        student['lastName'] = user["last_name"];
        student['avatar'] = avatar;
      end

      status 200
      return student.to_json
    else
      status 401
    end
  end

  # Get a student by id
  #
  # param [String] the student id
  #
  # return [Object] student
  get '/student/facebookId/:id' do
    if authorized?
      content_type :json

      student = Student.where(:facebookId => params[:id]).first()

      if student then
        redirect '/student/'+student.id;
      else
        status 401
      end

    else
      status 401
    end
  end

  # Create a new student by his/her facebookid
  #
  # return [Object] student
  post '/student/:facebookid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      student = Student.find_by(facebookId: params[:facebookid])

      unless student then
        student = Student.create(:facebookId => params[:facebookid])
      end

      status 200
      return  student.to_json
    else
      status 401
    end
  end

  # Update a student by id
  #
  # param [String] the student id
  #
  # body [Object] in JSON. ex: {"facebook_id":"<String>", "expert_level":"<Integer>" }
  #
  # return [Object] student
  put '/student/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      student = Student.find(params[:id])

      if student then
        data = JSON.parse request.body.read

        unless data['expertLevel'].nil?
          student.update_attributes(:expertLevel => data['expertLevel'])
          student.save
        end

        status 200
        return  student.to_json
      else
        return {"error" => "Student "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Delete a student by id
  #
  # param [String] the student id
  #
  # return [Object] message
  delete '/student/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      student = Student.find(params[:id])
      userid = student.facebookId;

      if student.destroy then
        status 200

        if ENV['XMPP_SERVER'].nil? then
          return {"message" => "Student "+params[:id]+" deleted"}.to_json
        else
          xmppresponse = open('http://'+ENV['XMPP_SERVER']+':'+ENV['XMPP_SERVER_PORT']+'/plugins/userService/userservice?type=delete&secret='+ENV['XMPP_SERVER_SECRET']+'&username='+userid);
          return {"message" => "Student "+params[:id]+" deleted (messaging account deleted: "+xmppresponse.status[1]+")"}.to_json
        end
      else
        status 500
        return {"error" => "Student "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
